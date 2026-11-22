import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import test from 'node:test'

const apps = [
  { workspace: '@codearena/arena-studio', port: 3101 },
  { workspace: 'codearena-bot-studio', port: 3102 },
  { workspace: 'codearena-dashboard', port: 3103 },
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForPage(url, child, getOutput) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited before serving ${url}:\n${getOutput()}`)
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) })
      if (response.ok) return await response.text()
    } catch {
      // Server is still starting.
    }
    await sleep(250)
  }
  throw new Error(`Timed out waiting for ${url}:\n${getOutput()}`)
}

test('each built app serves its home page', { timeout: 180_000 }, async () => {
  for (const app of apps) {
    const child = spawn(
      'npm',
      ['run', 'start', '-w', app.workspace, '--', '-p', String(app.port)],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PORT: String(app.port),
          NEXT_PUBLIC_BASE_PATH: '',
          NEXT_TELEMETRY_DISABLED: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
      },
    )

    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })

    try {
      const html = await waitForPage(`http://127.0.0.1:${app.port}/`, child, () => output)
      assert.match(html, /CodeArena/)
    } finally {
      try {
        process.kill(-child.pid, 'SIGTERM')
      } catch {
        child.kill('SIGTERM')
      }
    }
  }
})
