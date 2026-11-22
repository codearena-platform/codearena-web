"use client";

const styles = {
  main: { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center' },
  title: { color: '#e74c3c', margin: 0 },
  message: { color: '#888', maxWidth: '32rem', fontSize: '0.875rem' },
  button: { padding: '8px 16px', border: '1px solid #00f3ff', background: 'transparent', color: '#00f3ff', cursor: 'pointer', fontFamily: 'monospace' },
} as const;

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Something went wrong</h1>
      <p style={styles.message}>{error.message || 'An unexpected error occurred.'}</p>
      <button type="button" onClick={reset} style={styles.button}>Try again</button>
    </main>
  );
}
