/**
 * Hardening helpers for unauthenticated POST routes.
 *
 * Framework-agnostic on purpose: route handlers stay thin and the validation /
 * rate limiting behaviour can be exercised with the Node test runner without
 * booting Next.js. Every response carries security headers and error bodies
 * are generic so internal details are never returned to callers.
 */

export const DEFAULT_MAX_BODY_BYTES = 16 * 1024

const SECURITY_HEADERS: Record<string, string> = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  'cross-origin-resource-policy': 'same-origin',
}

export class HttpRequestError extends Error {
  readonly status: number
  readonly publicMessage: string
  readonly headers: Record<string, string>

  constructor(status: number, publicMessage: string, headers: Record<string, string> = {}) {
    super(publicMessage)
    this.name = 'HttpRequestError'
    this.status = status
    this.publicMessage = publicMessage
    this.headers = headers
  }
}

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  })
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpRequestError) {
    return jsonResponse({ error: error.publicMessage }, error.status, error.headers)
  }
  // Do not log or return library error messages/stacks from public endpoints.
  console.error('API request failed')
  return jsonResponse({ error: 'Internal server error' }, 500)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

export function integerInRange(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new HttpRequestError(400, 'Invalid request payload')
  }
  return value
}

export function stringInRange(value: unknown, min: number, max: number): string {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    throw new HttpRequestError(400, 'Invalid request payload')
  }
  return value
}

/** Reads a bounded JSON body, including when Content-Length is absent. */
export async function readJsonBody(request: Request, maxBytes = DEFAULT_MAX_BODY_BYTES): Promise<unknown> {
  const mediaType = (request.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase()
  if (mediaType !== 'application/json') {
    throw new HttpRequestError(415, 'Expected application/json')
  }

  const declaredLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new HttpRequestError(413, 'Payload too large')
  }
  if (!request.body) {
    throw new HttpRequestError(400, 'Invalid JSON payload')
  }

  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let totalBytes = 0
  let text = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel()
        throw new HttpRequestError(413, 'Payload too large')
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
  } catch (error) {
    if (error instanceof HttpRequestError) throw error
    throw new HttpRequestError(400, 'Invalid JSON payload')
  } finally {
    reader.releaseLock()
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new HttpRequestError(400, 'Invalid JSON payload')
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult
  reset(): void
}

/**
 * Fixed-window limiter with a bounded number of keys so spoofed IP headers
 * cannot grow the map without limit. Deploy behind a trusted proxy so the
 * client key cannot be chosen freely.
 */
export function createRateLimiter(limit: number, windowMs: number, maxKeys = 512): RateLimiter {
  const buckets = new Map<string, { count: number; resetAt: number }>()

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      const bucketKey = key.slice(0, 128) || 'unknown'
      let bucket = buckets.get(bucketKey)

      if (!bucket || now >= bucket.resetAt) {
        if (!bucket && buckets.size >= maxKeys) {
          const oldest = buckets.keys().next()
          if (!oldest.done) buckets.delete(oldest.value)
        }
        bucket = { count: 0, resetAt: now + windowMs }
        buckets.set(bucketKey, bucket)
      }

      if (bucket.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
        }
      }

      bucket.count += 1
      return { allowed: true, remaining: Math.max(0, limit - bucket.count), retryAfterSeconds: 0 }
    },
    reset(): void {
      buckets.clear()
    },
  }
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export interface PostHandlerOptions<T> {
  limiter: Pick<RateLimiter, 'check'>
  parse: (body: unknown) => T
  run: (input: T) => Promise<unknown>
  maxBodyBytes?: number
}

export async function handlePost<T>(request: Request, options: PostHandlerOptions<T>): Promise<Response> {
  const decision = options.limiter.check(getClientKey(request))
  if (!decision.allowed) {
    return jsonResponse({ error: 'Too many requests' }, 429, {
      'retry-after': String(decision.retryAfterSeconds),
    })
  }

  try {
    const body = await readJsonBody(request, options.maxBodyBytes)
    const input = options.parse(body)
    const result = await options.run(input)
    return jsonResponse(result)
  } catch (error) {
    return errorResponse(error)
  }
}

export interface MazeRequest {
  width: number
  height: number
  cellSize: number
}

/** Accepts the shapes used by Arena Studio while bounding the generated grid. */
export function parseMazeRequest(body: unknown): MazeRequest {
  if (!isRecord(body)) throw new HttpRequestError(400, 'Invalid request payload')

  const width = integerInRange(body.width, 100, 4000)
  const height = integerInRange(body.height, 100, 4000)
  const cellSize = body.cellSize === undefined ? 60 : integerInRange(body.cellSize, 20, 200)

  if (Math.ceil(width / cellSize) * Math.ceil(height / cellSize) > 40_000) {
    throw new HttpRequestError(400, 'Invalid request payload')
  }

  return { width, height, cellSize }
}
