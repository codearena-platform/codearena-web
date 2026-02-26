import Link from 'next/link'

export default function Home() {
  const arenaUrl = process.env.NEXT_PUBLIC_ARENA_URL || '/arena'
  const botUrl = process.env.NEXT_PUBLIC_BOT_URL || '/bot'
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || '/dashboard'

  const linkStyle = { padding: '12px 24px', border: '1px solid', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' as const }

  return (
    <main style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#00f3ff', textShadow: '0 0 20px #00f3ff', marginBottom: '8px' }}>CodeArena</h1>
      <p style={{ color: '#888', marginBottom: '32px' }}>AI Battle Royale Platform</p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href={arenaUrl} style={{ ...linkStyle, borderColor: '#00f3ff', color: '#00f3ff' }}>Arena Studio</Link>
        <Link href={botUrl} style={{ ...linkStyle, borderColor: '#ff00ff', color: '#ff00ff' }}>Bot Studio</Link>
        <Link href={dashboardUrl} style={{ ...linkStyle, borderColor: '#f3ff00', color: '#f3ff00' }}>Dashboard</Link>
      </div>
    </main>
  )
}
