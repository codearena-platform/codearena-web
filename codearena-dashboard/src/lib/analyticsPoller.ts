import type { WorldState } from './worldState'

export interface AnalyticsPollerOptions {
  getState: () => WorldState | null
  fetchAnalytics: (state: WorldState) => Promise<unknown>
  onData?: (data: unknown) => void
  onError?: (error: unknown) => void
  intervalMs?: number
  setTimer?: (callback: () => void, ms: number) => ReturnType<typeof setInterval>
  clearTimer?: (timer: ReturnType<typeof setInterval>) => void
}

export interface AnalyticsPoller {
  start(): void
  stop(): void
  poll(): Promise<void>
  isRunning(): boolean
}

/**
 * One mount-scoped interval owned by the caller. WebSocket messages only
 * update the state snapshot through `getState`; they never restart the timer,
 * so a busy stream cannot starve analytics polling.
 */
export function createAnalyticsPoller(options: AnalyticsPollerOptions): AnalyticsPoller {
  const intervalMs = options.intervalMs ?? 2000
  const setTimer = options.setTimer ?? ((callback: () => void, ms: number) => setInterval(callback, ms))
  const clearTimer = options.clearTimer ?? ((timer: ReturnType<typeof setInterval>) => clearInterval(timer))

  let timer: ReturnType<typeof setInterval> | null = null
  let inFlight = false

  async function poll(): Promise<void> {
    if (inFlight) return
    const state = options.getState()
    if (!state) return

    inFlight = true
    try {
      const data = await options.fetchAnalytics(state)
      options.onData?.(data)
    } catch (error) {
      options.onError?.(error)
    } finally {
      inFlight = false
    }
  }

  return {
    start(): void {
      if (timer !== null) return
      timer = setTimer(() => { void poll() }, intervalMs)
    },
    stop(): void {
      if (timer !== null) clearTimer(timer)
      timer = null
      inFlight = false
    },
    poll,
    isRunning(): boolean {
      return timer !== null
    },
  }
}
