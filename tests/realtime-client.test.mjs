import assert from 'node:assert/strict'
import test from 'node:test'

class FakeWebSocket {
  static OPEN = 1
  static instances = []

  constructor(url) {
    this.url = url
    this.readyState = 0
    FakeWebSocket.instances.push(this)
  }

  send() {}
  close() { this.readyState = 3 }
}

function lastUrl() {
  return new URL(FakeWebSocket.instances.at(-1).url)
}

test('realtime client defaults to wss in production and encodes match IDs', async () => {
  const previousSocket = global.WebSocket
  const previousWsUrl = process.env.NEXT_PUBLIC_WS_URL
  const previousNodeEnv = process.env.NODE_ENV
  global.WebSocket = FakeWebSocket
  delete process.env.NEXT_PUBLIC_WS_URL
  process.env.NODE_ENV = 'production'
  FakeWebSocket.instances.length = 0

  try {
    const { createRealtimeClient } = await import('../codearena-bot-studio/src/services/realtimeClient.ts')

    createRealtimeClient().connect('demo/42?round=1', { onMessage() {} })
    assert.equal(lastUrl().protocol, 'wss:')
    assert.equal(lastUrl().pathname, '/ws/match/demo%2F42%3Fround%3D1')

    createRealtimeClient('ws://gateway.test/bridge').connect('match 7', { onMessage() {} })
    assert.equal(lastUrl().host, 'gateway.test')
    assert.equal(lastUrl().pathname, '/bridge/ws/match/match%207')
  } finally {
    global.WebSocket = previousSocket
    if (previousWsUrl === undefined) delete process.env.NEXT_PUBLIC_WS_URL
    else process.env.NEXT_PUBLIC_WS_URL = previousWsUrl
    process.env.NODE_ENV = previousNodeEnv
  }
})
