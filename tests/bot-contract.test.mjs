import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BOT_ACTIONS,
  BOT_HANDLERS,
  analyzeBotProgram,
  wrapBotActions,
} from '../codearena-bot-studio/src/lib/botProgram.ts'

test('Blockly action blocks are wrapped in the validator handler contract', () => {
  const generated = wrapBotActions('bot.ahead(10);\nbot.fire(1.5);')

  assert.match(generated, /^onTick\(\(bot\) => \{\n/)
  assert.match(generated, /  bot\.ahead\(10\);/)
  assert.match(generated, /  bot\.fire\(1\.5\);/)
  assert.match(generated, /\}\);\n$/)

  const analysis = analyzeBotProgram(generated)
  assert.equal(analysis.valid, true)
  assert.deepEqual(analysis.errors, [])
  assert.equal(analysis.score, 100)
  assert.equal(wrapBotActions('   \n '), '')
})

test('validator accepts onMessage and rejects handler-less or unsafe programs', () => {
  const onMessage = 'onMessage((bot, message) => {\n  bot.turn(90);\n});'
  assert.equal(analyzeBotProgram(onMessage).valid, true)
  assert.equal(analyzeBotProgram('bot.ahead(10);').valid, false)
  assert.match(analyzeBotProgram('bot.ahead(10);').errors[0], /No event handler/)
  assert.ok(analyzeBotProgram('onTick(() => { while(true) {} });').errors.some((e) => /Infinite loop/.test(e)))
  assert.equal(analyzeBotProgram('').valid, false)
  assert.equal(analyzeBotProgram('').score, 0)

  assert.deepEqual([...BOT_HANDLERS], ['onTick', 'onMessage'])
  assert.ok(BOT_ACTIONS.includes('bot.activatePower('))
})
