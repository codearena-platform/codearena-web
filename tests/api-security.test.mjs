import assert from 'node:assert/strict'
import test from 'node:test'

import * as arenaApi from '../codearena-arena-studio/src/lib/apiSecurity.ts'
import * as botApi from '../codearena-bot-studio/src/lib/apiSecurity.ts'
import * as dashboardApi from '../codearena-dashboard/src/lib/apiSecurity.ts'

const encoder = new TextEncoder()

function requestWithBody(body, headers = {}) {
  return new Request('https://example.test/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  })
}

/** Request-like object that lets tests control declared and streamed size. */
function fakeBodyRequest(chunks, { contentType = 'application/json', contentLength } = {}) {
  const headers = new Headers()
  if (contentType !== null) headers.set('content-type', contentType)
  if (contentLength !== undefined) headers.set('content-length', String(contentLength))

  return {
    headers,
    body: new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
        controller.close()
      },
    }),
  }
}

async function expectStatus(promise, status) {
  const response = await promise
  assert.equal(response.status, status)
  return response
}

test('schema parsers reject invalid and unbounded payloads', () => {
  assert.deepEqual(arenaApi.parseMazeRequest({ width: 800, height: 600, cellSize: 50 }), {
    width: 800,
    height: 600,
    cellSize: 50,
  })
  assert.equal(arenaApi.parseMazeRequest({ width: 800, height: 600 }).cellSize, 60)
  assert.throws(() => arenaApi.parseMazeRequest({ width: -1, height: 600 }))
  assert.throws(() => arenaApi.parseMazeRequest({ width: 1e9, height: 1e9, cellSize: 20 }))
  assert.throws(() => arenaApi.parseMazeRequest({ width: 800, height: 600, cellSize: 1 }))

  assert.equal(botApi.parseValidateRequest({ code: 'function onTick() {}' }), 'function onTick() {}')
  assert.throws(() => botApi.parseValidateRequest({ code: 'x'.repeat(65 * 1024) }))
  assert.throws(() => botApi.parseValidateRequest({ code: 42 }))

  const analytics = dashboardApi.parseAnalyticsRequest({
    bots: [{ id: 'bot-1', hull: 75 }],
    bullets: [{ x: 1, y: 2 }],
  })
  assert.equal(analytics.bots[0].hull, 75)
  assert.equal(analytics.bullets.length, 1)
  assert.throws(() => dashboardApi.parseAnalyticsRequest({ bots: 'not-an-array' }))
  assert.throws(() => dashboardApi.parseAnalyticsRequest({
    bots: Array.from({ length: 1000 }, () => ({ id: 'x', hull: 100 })),
    bullets: [],
  }))
  assert.throws(() => dashboardApi.parseAnalyticsRequest({ bots: [{ id: 'x', hull: 'NaN' }] }))
})

test('JSON body reader enforces content type and both declared and streamed caps', async () => {
  await assert.rejects(
    () => arenaApi.readJsonBody(fakeBodyRequest(['{}'], { contentType: 'text/plain' })),
    (error) => error.status === 415,
  )
  await assert.rejects(
    () => arenaApi.readJsonBody(fakeBodyRequest(['{}'], { contentLength: 5000 }), 100),
    (error) => error.status === 413,
  )
  await assert.rejects(
    () => arenaApi.readJsonBody(fakeBodyRequest(['{"pad":"', 'x'.repeat(200), '"}']), 100),
    (error) => error.status === 413,
  )
  await assert.rejects(
    () => arenaApi.readJsonBody(fakeBodyRequest(['{invalid'])),
    (error) => error.status === 400,
  )

  assert.deepEqual(await arenaApi.readJsonBody(fakeBodyRequest(['{"ok":', 'true}'])), { ok: true })
})

test('rate limiter enforces the window and bounds its key store', () => {
  const limiter = arenaApi.createRateLimiter(2, 1000, 2)

  assert.equal(limiter.check('10.0.0.1', 0).allowed, true)
  assert.equal(limiter.check('10.0.0.1', 0).allowed, true)
  const blocked = limiter.check('10.0.0.1', 0)
  assert.equal(blocked.allowed, false)
  assert.equal(blocked.remaining, 0)
  assert.equal(blocked.retryAfterSeconds, 1)

  assert.equal(limiter.check('10.0.0.1', 1000).allowed, true)
  assert.equal(limiter.check('10.0.0.2', 1000).allowed, true)
  assert.equal(limiter.check('10.0.0.3', 1000).allowed, true)
  // 10.0.0.1 was evicted when the key cap was reached.
  assert.equal(limiter.check('10.0.0.1', 1000).allowed, true)
})

test('handlePost returns 429 with Retry-After before touching the handler', async () => {
  const limiter = arenaApi.createRateLimiter(1, 60_000)
  let runs = 0
  const options = {
    limiter,
    parse: (body) => body,
    run: async () => { runs += 1; return { ok: true } },
  }
  const request = () => requestWithBody('{}', { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })

  await expectStatus(arenaApi.handlePost(request(), options), 200)
  const blocked = await expectStatus(arenaApi.handlePost(request(), options), 429)
  assert.equal(blocked.headers.get('retry-after'), '60')
  assert.equal(runs, 1)
})

test('handlePost never exposes internal errors and always sets security headers', async () => {
  const response = await arenaApi.handlePost(requestWithBody('{}'), {
    limiter: arenaApi.createRateLimiter(5, 60_000),
    parse: (body) => body,
    run: async () => { throw new Error('secret internal detail') },
  })

  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'Internal server error' })
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-frame-options'), 'DENY')
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
  assert.match(response.headers.get('content-security-policy'), /default-src 'none'/)
  assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin')

  const invalid = await arenaApi.handlePost(requestWithBody('not json'), {
    limiter: arenaApi.createRateLimiter(5, 60_000),
    parse: (body) => body,
    run: async () => ({ ok: true }),
  })
  assert.equal(invalid.status, 400)
  assert.deepEqual(await invalid.json(), { error: 'Invalid JSON payload' })
})

test('client key is derived from the first forwarded address', () => {
  const request = requestWithBody('{}', { 'x-forwarded-for': '198.51.100.4, 10.0.0.2' })
  assert.equal(arenaApi.getClientKey(request), '198.51.100.4')
  assert.equal(arenaApi.getClientKey(requestWithBody('{}')), 'unknown')
})
