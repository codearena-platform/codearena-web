import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeValidationResponse } from '../codearena-bot-studio/src/lib/validationResponse.ts'

test('valid validation payloads are passed through unchanged', () => {
  const payload = { valid: true, errors: [], warnings: ['short bot'], score: 90 }
  assert.deepEqual(normalizeValidationResponse(200, payload), payload)
})

test('server and malformed responses become renderable errors', () => {
  assert.deepEqual(normalizeValidationResponse(500, { error: 'worker exploded' }), {
    valid: false,
    errors: ['worker exploded'],
    warnings: [],
    score: 0,
  })
  assert.deepEqual(normalizeValidationResponse(503, {}), {
    valid: false,
    errors: ['Validation failed (503)'],
    warnings: [],
    score: 0,
  })
  assert.deepEqual(normalizeValidationResponse(200, { valid: true }), {
    valid: false,
    errors: ['Validation service returned an invalid response'],
    warnings: [],
    score: 0,
  })
  assert.deepEqual(normalizeValidationResponse(200, { valid: true, errors: [], warnings: [], score: NaN }), {
    valid: false,
    errors: ['Validation service returned an invalid response'],
    warnings: [],
    score: 0,
  })
  assert.deepEqual(normalizeValidationResponse(0, null), {
    valid: false,
    errors: ['Validation failed (0)'],
    warnings: [],
    score: 0,
  })
})
