import assert from 'node:assert/strict'
import test from 'node:test'

import {
  normalizeBasePath,
  resolveAppHref,
  resolvePlatformHref,
  withBasePath,
} from '../codearena-ui/src/lib/appConfig.ts'

test('base paths are normalised without duplicating prefixes', () => {
  assert.equal(normalizeBasePath(undefined), '')
  assert.equal(normalizeBasePath(''), '')
  assert.equal(normalizeBasePath('/'), '')
  assert.equal(normalizeBasePath('platform/'), '/platform')
  assert.equal(normalizeBasePath(' /platform// '), '/platform')

  assert.equal(withBasePath('/api/validate', '/platform'), '/platform/api/validate')
  assert.equal(withBasePath('/platform/api/validate', '/platform'), '/platform/api/validate')
  assert.equal(withBasePath('/api/validate', ''), '/api/validate')
  assert.equal(withBasePath('https://example.test/api', '/platform'), 'https://example.test/api')
  assert.equal(withBasePath('', '/platform'), '/platform')
})

test('navigation hrefs stay Link-compatible and use configured external URLs', () => {
  const urls = {
    arena: 'https://arena.example.test/studio',
    bot: ' /bot-studio ',
    dashboard: '',
  }

  assert.equal(resolveAppHref('arena', urls), 'https://arena.example.test/studio')
  assert.equal(resolveAppHref('bot', urls), '/bot-studio')
  // Internal fallbacks are left unprefixed; next/link applies the app basePath.
  assert.equal(resolveAppHref('dashboard', urls), '/dashboard')
  assert.equal(resolvePlatformHref('/platform'), '/platform')
  assert.equal(resolvePlatformHref(''), '/')
})
