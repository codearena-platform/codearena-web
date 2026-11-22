import assert from 'node:assert/strict'
import test from 'node:test'

import { createAnalyticsPoller } from '../codearena-dashboard/src/lib/analyticsPoller.ts'
import { normalizeWorldState, parseWorldStateMessage } from '../codearena-dashboard/src/lib/worldState.ts'

function makeWorldState(botCount = 1) {
  return {
    tick: 1,
    bots: Array.from({ length: botCount }, (_, index) => ({
      id: `bot-${index}`,
      class: 'scout',
      position: { x: index * 10, y: 20 },
      hull: 80,
    })),
    bullets: [{ position: { x: 5, y: 6 } }],
  }
}

function makeTimer() {
  const callbacks = new Map()
  let nextId = 1
  return {
    setTimer(callback) {
      const id = nextId++
      callbacks.set(id, callback)
      return id
    },
    clearTimer(id) {
      callbacks.delete(id)
    },
    fire() {
      for (const callback of [...callbacks.values()]) callback()
    },
    get count() {
      return callbacks.size
    },
  }
}

async function flush() {
  await new Promise((resolve) => setImmediate(resolve))
}

test('WebSocket messages are parsed, normalised and capped before rendering', () => {
  const state = parseWorldStateMessage(JSON.stringify({
    Tick: 12,
    Zone: { X: 10, Y: 20, Radius: 30 },
    Bots: [{ Id: 'alpha', Class: 'Tank', Position: { X: 2, Y: 3 }, Hull: 90 }],
    Bullets: [{ Position: { x: 4, y: 5 } }],
  }))

  assert.equal(state.tick, 12)
  assert.deepEqual(state.zone, { x: 10, y: 20, radius: 30 })
  assert.equal(state.bots[0].id, 'alpha')
  assert.equal(state.bots[0].class, 'Tank')
  assert.deepEqual(state.bots[0].position, { x: 2, y: 3 })
  assert.equal(state.bullets[0].position.x, 4)

  assert.equal(parseWorldStateMessage('{not json'), null)
  assert.equal(parseWorldStateMessage(JSON.stringify({ tick: 'yes' })), null)
  assert.equal(parseWorldStateMessage(JSON.stringify({ bots: {} })), null)
  assert.equal(parseWorldStateMessage('{"tick":1e400}'), null)
  assert.equal(parseWorldStateMessage({ tick: Number.POSITIVE_INFINITY }), null)
  assert.equal(parseWorldStateMessage({ bots: Array.from({ length: 201 }, () => ({ id: 'x' })) }), null)
  assert.equal(parseWorldStateMessage({ bullets: Array.from({ length: 2001 }, () => ({})) }), null)
  assert.equal(parseWorldStateMessage({ bots: [{ id: 'x', position: { x: 'left', y: 1 } }] }), null)
  assert.equal(parseWorldStateMessage(`"${'x'.repeat(256 * 1024 + 1)}"`), null)
  assert.equal(parseWorldStateMessage(new Blob(['{}'])), null)
  assert.equal(normalizeWorldState(null), null)
})

test('analytics polling starts once on mount and is not rescheduled by state changes', async () => {
  const timer = makeTimer()
  let state = makeWorldState(1)
  const seen = []
  const poller = createAnalyticsPoller({
    getState: () => state,
    fetchAnalytics: async (snapshot) => ({ intensityIndex: snapshot.bots.length, averageHull: 50 }),
    onData: (data) => seen.push(data),
    intervalMs: 2000,
    setTimer: timer.setTimer,
    clearTimer: timer.clearTimer,
  })

  assert.equal(poller.isRunning(), false)
  poller.start()
  poller.start()
  assert.equal(timer.count, 1)

  // Simulate several WebSocket ticks updating the snapshot.
  state = makeWorldState(3)
  assert.equal(timer.count, 1)

  timer.fire()
  await flush()
  assert.deepEqual(seen, [{ intensityIndex: 3, averageHull: 50 }])

  timer.fire()
  await flush()
  assert.equal(seen.length, 2)

  poller.stop()
  assert.equal(poller.isRunning(), false)
  assert.equal(timer.count, 0)
  timer.fire()
  await flush()
  assert.equal(seen.length, 2)
})

test('poller skips overlapping fetches and survives request failures', async () => {
  const timer = makeTimer()
  let resolveFetch
  let calls = 0
  const errors = []
  const poller = createAnalyticsPoller({
    getState: () => makeWorldState(),
    fetchAnalytics: () => {
      calls += 1
      return new Promise((resolve) => { resolveFetch = resolve })
    },
    onError: (error) => errors.push(error),
    setTimer: timer.setTimer,
    clearTimer: timer.clearTimer,
  })

  poller.start()
  timer.fire()
  timer.fire()
  await flush()
  assert.equal(calls, 1)

  resolveFetch({ ok: true })
  await flush()
  timer.fire()
  await flush()
  assert.equal(calls, 2)

  poller.stop()
  const failing = createAnalyticsPoller({
    getState: () => makeWorldState(),
    fetchAnalytics: async () => { throw new Error('network down') },
    onError: (error) => errors.push(error),
    setTimer: timer.setTimer,
    clearTimer: timer.clearTimer,
  })
  await failing.poll()
  assert.equal(errors.length, 1)
  assert.match(errors[0].message, /network down/)
})
