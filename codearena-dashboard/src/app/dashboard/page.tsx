'use client'

import { useEffect, useRef, useState } from 'react'

export default function DashboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Connecting...')
  const [worldState, setWorldState] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)

  // Fetch background analytics periodically from the Node.js Tasklet API
  useEffect(() => {
    if (!worldState) return;

    const fetchAnalytics = async () => {
      try {
        const resp = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(worldState)
        });
        const data = await resp.json();
        setAnalytics(data);
      } catch (e) {
        console.error('Analytics failed', e);
      }
    };

    const timer = setTimeout(fetchAnalytics, 2000); // Process every 2 seconds
    return () => clearTimeout(timer);
  }, [worldState])

  useEffect(() => {
    let ws: WebSocket | null = null
    try {
      let url = 'ws://localhost:8080/ws'
      if (typeof process !== 'undefined') {
        if (process.env.NEXT_PUBLIC_DASHBOARD_WS_URL) url = process.env.NEXT_PUBLIC_DASHBOARD_WS_URL
        else if (process.env.NEXT_PUBLIC_WS_URL) url = String(process.env.NEXT_PUBLIC_WS_URL).replace(/^http/, 'ws') + '/ws'
      }
      ws = new WebSocket(url)
    } catch (e) {
      setError('Invalid WebSocket URL')
      return
    }

    ws.onopen = () => { setStatus('Live'); setError(null) }
    ws.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data)
        setWorldState(state)
      } catch (e) {
        setError('Invalid JSON received')
      }
    }
    ws.onclose = () => setStatus('Disconnected')
    ws.onerror = () => { setStatus('Error'); setError('Connection failed') }
    return () => { ws?.close() }
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
      const x = zone.x ?? zone.X
      const y = zone.y ?? zone.Y
      const radius = zone.radius ?? zone.Radius
      if (x != null && y != null && radius != null) {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = 'rgba(255, 0, 0, 0.05)'
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.arc(x, y, radius, 0, Math.PI * 2, true)
        ctx.fill()
      }
    }

    const bullets = worldState.bullets ?? worldState.Bullets ?? []
    bullets.forEach((b: any) => {
      const pos = b.position ?? b.Position ?? {}
      const px = pos.x ?? pos.X ?? 0
      const py = pos.y ?? pos.Y ?? 0
      ctx.fillStyle = '#fff'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#fff'
      ctx.beginPath()
      ctx.arc(px, py, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })

    const bots = worldState.bots ?? worldState.Bots ?? []
    bots.forEach((bot: any) => {
      const cls = (bot.class ?? bot.Class ?? '').toString().toLowerCase()
      const color = cls === 'tank' ? '#f39c12' : cls === 'scout' ? '#3498db' : '#e74c3c'
      const pos = bot.position ?? bot.Position ?? {}
      const px = pos.x ?? pos.X ?? 0
      const py = pos.y ?? pos.Y ?? 0
      const radarH = bot.radarHeading ?? bot.RadarHeading ?? 0
      const heading = bot.heading ?? bot.Heading ?? 0
      const gunH = bot.gunHeading ?? bot.GunHeading ?? 0
      const hull = bot.hull ?? bot.Hull ?? 100
      const energy = bot.energy ?? bot.Energy ?? 100
      const shieldHp = bot.shield_hp ?? bot.shieldHp ?? bot.ShieldHp ?? 0
      const isStealthed = bot.is_stealthed ?? bot.isStealthed ?? false

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(radarH * Math.PI / 180)
      const fov = cls === 'scout' ? 120 : cls === 'sniper' ? 30 : 60
      ctx.fillStyle = 'rgba(46, 204, 113, 0.1)'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, 800, -(fov / 2) * Math.PI / 180, (fov / 2) * Math.PI / 180)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(heading * Math.PI / 180)
      ctx.fillStyle = color
      ctx.shadowBlur = isStealthed ? 20 : 0
      ctx.shadowColor = '#fff'
      ctx.globalAlpha = isStealthed ? 0.3 : 1.0
      ctx.fillRect(-10, -10, 20, 20)
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(-10, -10, 20, 20)
      ctx.globalAlpha = 1.0
      ctx.fillStyle = '#c0392b'
      ctx.fillRect(-15, -25, 30, 4)
      ctx.fillStyle = '#27ae60'
      ctx.fillRect(-15, -25, 30 * (hull / 100), 4)
      ctx.restore()

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(gunH * Math.PI / 180)
      ctx.fillStyle = '#95a5a6'
      ctx.fillRect(-3, -22, 6, 22)
      ctx.restore()

      if (shieldHp > 0) {
        ctx.beginPath()
        ctx.arc(px, py, 18, 0, Math.PI * 2)
        ctx.strokeStyle = '#3498db'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      const name = bot.name ?? bot.Name ?? bot.id ?? bot.Id ?? ''
      ctx.fillStyle = '#eee'
      ctx.font = '10px monospace'
      ctx.fillText(`${name}`, px - 30, py + 30)
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
        <div style={{ padding: '5px 15px', borderRadius: '20px', backgroundColor: status === 'Live' ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}>
          {status} - TICK: {worldState?.tick ?? worldState?.Tick ?? 0}
        </div>
      </header>

      <div style={{ display: 'flex', gap: '30px', width: '100%', maxWidth: '1200px' }}>
        <section style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={800} height={600} style={{ backgroundColor: '#000', border: '1px solid #00ffff', borderRadius: '4px', boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)' }} />
        </section>
        <section style={{ flex: 1, backgroundColor: '#0f0f0f', border: '1px solid #333', borderRadius: '4px', padding: '15px', maxHeight: '600px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#00ffff', marginTop: 0 }}>Battle Stream</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(worldState?.bots ?? worldState?.Bots ?? []).map((bot: any) => {
              const cls = (bot.class ?? bot.Class ?? '').toString().toLowerCase()
              const color = cls === 'tank' ? '#f39c12' : cls === 'scout' ? '#3498db' : '#e74c3c'
              const hull = bot.hull ?? bot.Hull ?? 0
              const energy = bot.energy ?? bot.Energy ?? 0
              const shieldHp = bot.shield_hp ?? bot.shieldHp ?? bot.ShieldHp ?? 0
              return (
                <div key={bot.id ?? bot.Id} style={{ padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '4px', borderLeft: `4px solid ${color}` }}>
                  <div style={{ fontWeight: 'bold' }}>{bot.id ?? bot.Id}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>HP: {Math.floor(hull)}% | EN: {Math.floor(energy)} | SH: {Math.floor(shieldHp)}</div>
                </div>
              )
            })}
          </div>
          <h3 style={{ fontSize: '1rem', color: '#888', marginTop: '20px' }}>Raw State</h3>
          <pre style={{ fontSize: '10px', color: '#666' }}>{JSON.stringify(worldState, null, 2)}</pre>
        </section>
      </div>
    </main>
  )
}
