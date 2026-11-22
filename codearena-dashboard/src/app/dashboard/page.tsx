'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { normalizeBasePath, withBasePath } from '@codearena/ui'
import { createAnalyticsPoller } from '../../lib/analyticsPoller'
import { parseWorldStateMessage, type WorldState } from '../../lib/worldState'

function resolveDashboardWsUrl(): string | null {
  let url = process.env.NODE_ENV === 'production' ? 'wss://localhost:8080/ws' : 'ws://localhost:8080/ws'
  if (process.env.NEXT_PUBLIC_DASHBOARD_WS_URL) url = process.env.NEXT_PUBLIC_DASHBOARD_WS_URL
  else if (process.env.NEXT_PUBLIC_WS_URL) url = String(process.env.NEXT_PUBLIC_WS_URL).replace(/^http/, 'ws') + '/ws'
  try {
    new URL(url)
    return url
  } catch {
    return null
  }
}

const DASHBOARD_WS_URL = resolveDashboardWsUrl()
const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

interface AnalyticsSummary {
  intensityIndex: number
  averageHull: number
}

function isAnalyticsSummary(value: unknown): value is AnalyticsSummary {
  if (typeof value !== 'object' || value === null) return false
  const summary = value as Record<string, unknown>
  return (
    typeof summary.intensityIndex === 'number' && Number.isFinite(summary.intensityIndex) &&
    typeof summary.averageHull === 'number' && Number.isFinite(summary.averageHull)
  )
}

function botColor(className: string): string {
  const normalized = className.toLowerCase()
  if (normalized === 'tank') return '#f39c12'
  if (normalized === 'scout') return '#3498db'
  return '#e74c3c'
}

export default function DashboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Connecting...')
  const [worldState, setWorldState] = useState<WorldState | null>(null)
  const [error, setError] = useState<string | null>(DASHBOARD_WS_URL ? null : 'Invalid WebSocket URL')
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const worldStateRef = useRef<WorldState | null>(null)

  // The interval is created once on mount. Incoming WebSocket ticks only swap
  // the snapshot in worldStateRef; they never cancel or reschedule this timer.
  useEffect(() => {
    const poller = createAnalyticsPoller({
      getState: () => worldStateRef.current,
      fetchAnalytics: async (state) => {
        const response = await fetch(withBasePath('/api/analytics', BASE_PATH), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        })
        if (!response.ok) throw new Error(`Analytics request failed (${response.status})`)
        return response.json()
      },
      onData: (data) => {
        if (isAnalyticsSummary(data)) setAnalytics(data)
      },
    })
    poller.start()
    return () => poller.stop()
  }, [])

  useEffect(() => {
    if (!DASHBOARD_WS_URL) return

    const ws = new WebSocket(DASHBOARD_WS_URL)
    ws.onopen = () => { setStatus('Live'); setError(null) }
    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        setError('Invalid WebSocket message')
        return
      }
      const state = parseWorldStateMessage(event.data)
      if (!state) {
        setError('Invalid WebSocket message')
        return
      }
      setError(null)
      worldStateRef.current = state
      setWorldState(state)
    }
    ws.onclose = () => setStatus('Disconnected')
    ws.onerror = () => { setStatus('Error'); setError('Connection failed') }
    return () => { ws.close() }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !worldState) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const width = 800
    const height = 600

    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = '#111'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke()
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke()
    }

    const zone = worldState.zone
    if (zone) {
      ctx.beginPath()
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = 'rgba(255, 0, 0, 0.05)'
      ctx.beginPath()
      ctx.rect(0, 0, width, height)
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2, true)
      ctx.fill()
    }

    worldState.bullets.forEach((bullet) => {
      ctx.fillStyle = '#fff'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#fff'
      ctx.beginPath()
      ctx.arc(bullet.position.x, bullet.position.y, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })

    worldState.bots.forEach((bot) => {
      const color = botColor(bot.class)
      const px = bot.position.x
      const py = bot.position.y

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(bot.radarHeading * Math.PI / 180)
      const fov = bot.class.toLowerCase() === 'scout' ? 120 : bot.class.toLowerCase() === 'sniper' ? 30 : 60
      ctx.fillStyle = 'rgba(46, 204, 113, 0.1)'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, 800, -(fov / 2) * Math.PI / 180, (fov / 2) * Math.PI / 180)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(bot.heading * Math.PI / 180)
      ctx.fillStyle = color
      ctx.shadowBlur = bot.isStealthed ? 20 : 0
      ctx.shadowColor = '#fff'
      ctx.globalAlpha = bot.isStealthed ? 0.3 : 1.0
      ctx.fillRect(-10, -10, 20, 20)
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(-10, -10, 20, 20)
      ctx.globalAlpha = 1.0
      ctx.fillStyle = '#c0392b'
      ctx.fillRect(-15, -25, 30, 4)
      ctx.fillStyle = '#27ae60'
      ctx.fillRect(-15, -25, 30 * (bot.hull / 100), 4)
      ctx.restore()

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(bot.gunHeading * Math.PI / 180)
      ctx.fillStyle = '#95a5a6'
      ctx.fillRect(-3, -22, 6, 22)
      ctx.restore()

      if (bot.shieldHp > 0) {
        ctx.beginPath()
        ctx.arc(px, py, 18, 0, Math.PI * 2)
        ctx.strokeStyle = '#3498db'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.fillStyle = '#eee'
      ctx.font = '10px monospace'
      ctx.fillText(bot.name || bot.id, px - 30, py + 30)
    })

  }, [worldState])

  return (
    <main style={{ padding: '20px 0', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
      <header style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff', margin: 0 }}>COMMAND CENTER</h1>
          {analytics && (
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
              INTENSITY: <span style={{ color: '#27ae60' }}>{analytics.intensityIndex}</span> |
              AVG HULL: <span style={{ color: '#3498db' }}>{analytics.averageHull}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/system"
            className="px-4 py-2 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            System Health
          </Link>
          <div style={{ padding: '5px 15px', borderRadius: '20px', backgroundColor: status === 'Live' ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}>
            {status} - TICK: {worldState?.tick ?? 0}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '30px', width: '100%', maxWidth: '1200px' }}>
        <section style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={800} height={600} style={{ backgroundColor: '#000', border: '1px solid #00ffff', borderRadius: '4px', boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)' }} />
        </section>
        <section style={{ flex: 1, backgroundColor: '#0f0f0f', border: '1px solid #333', borderRadius: '4px', padding: '15px', maxHeight: '600px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#00ffff', marginTop: 0 }}>Battle Stream</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {worldState?.bots.map((bot) => (
              <div key={bot.id} style={{ padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '4px', borderLeft: `4px solid ${botColor(bot.class)}` }}>
                <div style={{ fontWeight: 'bold' }}>{bot.id}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>HP: {Math.floor(bot.hull)}% | EN: {Math.floor(bot.energy)} | SH: {Math.floor(bot.shieldHp)}</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: '1rem', color: '#888', marginTop: '20px' }}>Raw State</h3>
          <pre style={{ fontSize: '10px', color: '#666' }}>{JSON.stringify(worldState, null, 2)}</pre>
        </section>
      </div>
    </main>
  )
}
