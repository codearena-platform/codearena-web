import React from 'react'
import '@codearena/ui/theme'
import { Nav } from '@codearena/ui/Nav'

export const metadata = {
  title: 'CodeArena Dashboard',
  description: 'AI Battle Royale Real-time Monitoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: 'var(--cyber-black,#0a0a0a)', color: '#eee', fontFamily: 'monospace' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 20px' }}>
          <Nav current="dashboard" />
          {children}
        </div>
      </body>
    </html>
  )
}
