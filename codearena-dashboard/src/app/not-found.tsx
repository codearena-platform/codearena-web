import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#00ffff', margin: 0 }}>404 — Page not found</h1>
      <p style={{ color: '#888' }}>This route is not part of the dashboard.</p>
      <Link href="/" style={{ padding: '8px 16px', border: '1px solid #00f3ff', color: '#00f3ff', textDecoration: 'none' }}>
        Back to dashboard
      </Link>
    </main>
  );
}
