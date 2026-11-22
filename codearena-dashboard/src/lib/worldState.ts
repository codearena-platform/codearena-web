/**
 * Validation and normalisation for dashboard WebSocket world-state messages.
 * Only data that passes these checks is allowed to reach React state/canvas.
 */

export interface Point {
  x: number
  y: number
}

export interface WorldZone extends Point {
  radius: number
}

export interface BotSnapshot {
  id: string
  name: string
  class: string
  position: Point
  radarHeading: number
  heading: number
  gunHeading: number
  hull: number
  energy: number
  shieldHp: number
  isStealthed: boolean
}

export interface BulletSnapshot {
  position: Point
}

export interface WorldState {
  tick: number
  zone: WorldZone | null
  bots: BotSnapshot[]
  bullets: BulletSnapshot[]
}

const MAX_MESSAGE_BYTES = 256 * 1024
const MAX_BOTS = 200
const MAX_BULLETS = 2000
const MAX_COORDINATE = 1_000_000
const MAX_TEXT_LENGTH = 128

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function pick(record: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null) return value
  }
  return undefined
}

function numberField(
  record: Record<string, unknown>,
  keys: readonly string[],
  fallback: number,
  min: number,
  max: number,
): number {
  const value = pick(record, keys)
  if (value === undefined) return fallback
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error('Invalid numeric field')
  }
  return value
}

function textField(record: Record<string, unknown>, keys: readonly string[], fallback: string): string {
  const value = pick(record, keys)
  if (value === undefined) return fallback
  if (
    (typeof value !== 'string' && typeof value !== 'number') ||
    String(value).length > MAX_TEXT_LENGTH
  ) {
    throw new Error('Invalid text field')
  }
  return String(value)
}

function booleanField(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const value = pick(record, keys)
  if (value === undefined) return false
  if (typeof value !== 'boolean') throw new Error('Invalid boolean field')
  return value
}

function pointField(record: Record<string, unknown>, keys: readonly string[]): Point {
  const value = pick(record, keys)
  if (value === undefined) return { x: 0, y: 0 }
  if (!isRecord(value)) throw new Error('Invalid position')
  return {
    x: numberField(value, ['x', 'X'], 0, -MAX_COORDINATE, MAX_COORDINATE),
    y: numberField(value, ['y', 'Y'], 0, -MAX_COORDINATE, MAX_COORDINATE),
  }
}

function parseBot(value: unknown, index: number): BotSnapshot {
  if (!isRecord(value)) throw new Error('Invalid bot')

  return {
    id: textField(value, ['id', 'Id'], `bot-${index}`),
    name: textField(value, ['name', 'Name'], ''),
    class: textField(value, ['class', 'Class'], 'unknown'),
    position: pointField(value, ['position', 'Position']),
    radarHeading: numberField(value, ['radarHeading', 'RadarHeading'], 0, -360, 360),
    heading: numberField(value, ['heading', 'Heading'], 0, -360, 360),
    gunHeading: numberField(value, ['gunHeading', 'GunHeading'], 0, -360, 360),
    hull: numberField(value, ['hull', 'Hull'], 0, 0, 1000),
    energy: numberField(value, ['energy', 'Energy'], 0, 0, 1000),
    shieldHp: numberField(value, ['shield_hp', 'shieldHp', 'ShieldHp'], 0, 0, 1000),
    isStealthed: booleanField(value, ['is_stealthed', 'isStealthed', 'IsStealthed']),
  }
}

function parseBullet(value: unknown): BulletSnapshot {
  if (!isRecord(value)) throw new Error('Invalid bullet')
  return { position: pointField(value, ['position', 'Position']) }
}

/** Normalises a decoded world state; returns null when the shape is unsafe. */
export function normalizeWorldState(value: unknown): WorldState | null {
  if (!isRecord(value)) return null

  try {
    const tick = pick(value, ['tick', 'Tick']) ?? 0
    if (
      typeof tick !== 'number' ||
      !Number.isInteger(tick) ||
      tick < 0 ||
      tick > Number.MAX_SAFE_INTEGER
    ) {
      return null
    }

    let zone: WorldZone | null = null
    const rawZone = pick(value, ['zone', 'Zone'])
    if (rawZone !== undefined) {
      if (!isRecord(rawZone)) return null
      const nestedPosition = pick(rawZone, ['position', 'Position'])
      const point = nestedPosition !== undefined
        ? pointField(rawZone, ['position', 'Position'])
        : {
          x: numberField(rawZone, ['x', 'X'], 0, -MAX_COORDINATE, MAX_COORDINATE),
          y: numberField(rawZone, ['y', 'Y'], 0, -MAX_COORDINATE, MAX_COORDINATE),
        }
      zone = {
        ...point,
        radius: numberField(rawZone, ['radius', 'Radius'], 0, 0, MAX_COORDINATE),
      }
    }

    const rawBots = pick(value, ['bots', 'Bots']) ?? []
    const rawBullets = pick(value, ['bullets', 'Bullets']) ?? []
    if (!Array.isArray(rawBots) || !Array.isArray(rawBullets)) return null
    if (rawBots.length > MAX_BOTS || rawBullets.length > MAX_BULLETS) return null

    return {
      tick,
      zone,
      bots: rawBots.map(parseBot),
      bullets: rawBullets.map(parseBullet),
    }
  } catch {
    return null
  }
}

/** Parses an incoming WebSocket payload (string or already-decoded JSON). */
export function parseWorldStateMessage(raw: unknown): WorldState | null {
  if (typeof raw !== 'string') return normalizeWorldState(raw)
  if (new TextEncoder().encode(raw).byteLength > MAX_MESSAGE_BYTES) return null

  try {
    return normalizeWorldState(JSON.parse(raw))
  } catch {
    return null
  }
}
