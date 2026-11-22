import assert from 'node:assert/strict'
import test from 'node:test'

import { exportToEngineSchema } from '../codearena-arena-studio/src/utils/arenaExporter.ts'

test('arena exporter normalises positions for the simulation engine', () => {
  const json = exportToEngineSchema(
    { name: 'Test', width: 800, height: 600, theme: 'cyber', gravity: 0 },
    [{ id: 'wall-1', type: 'wall', position: { x: 1.6, y: -0.4, z: 25.5 }, rotation: 91 }],
  )
  const schema = JSON.parse(json)

  assert.equal(schema.version, '1.0')
  assert.equal(schema.settings.name, 'Test')
  assert.deepEqual(schema.entities[0].position, { x: 2, y: 0, z: 26 })
  assert.equal(schema.entities[0].rotation, 90)
})
