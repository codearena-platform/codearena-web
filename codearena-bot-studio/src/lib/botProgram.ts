/**
 * Shared contract between the Blockly generator and the validation service.
 *
 * A bot program must define at least one event handler:
 *   onTick((bot) => { ... }) or onMessage((bot, message) => { ... })
 * Inside a handler the SDK exposes bot.ahead, bot.turn, bot.fire and
 * bot.activatePower. The generator only emits action statements and wraps them
 * in onTick; the validator accepts either handler.
 */

export const BOT_HANDLERS = ["onTick", "onMessage"] as const;
export const BOT_ACTIONS = [
  "bot.ahead(",
  "bot.turn(",
  "bot.fire(",
  "bot.activatePower(",
] as const;
export const MAX_BOT_CODE_LENGTH = 64 * 1024;

const HANDLER_PATTERN = /\b(?:onTick|onMessage)\s*\(/;
const INFINITE_LOOP_PATTERN = /\bwhile\s*\(\s*true\s*\)/;
const MIN_PROGRAM_LENGTH = 50;

export interface BotProgramAnalysis {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

/** Wrap generated action statements in the handler required by the SDK. */
export function wrapBotActions(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";

  const indented = trimmed
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `onTick((bot) => {\n${indented}\n});\n`;
}

/** Pure validation logic shared by the API route and its tests. */
export function analyzeBotProgram(code: string): BotProgramAnalysis {
  const errors: string[] = [];
  const warnings: string[] = [];
  let penalty = 0;

  if (!code.trim()) {
    errors.push("Program is empty");
    penalty += 100;
  }
  if (INFINITE_LOOP_PATTERN.test(code)) {
    errors.push("Infinite loop detected");
    penalty += 50;
  }
  if (!HANDLER_PATTERN.test(code)) {
    errors.push(`No event handler found (${BOT_HANDLERS.join("/")})`);
    penalty += 30;
  }
  if (code.trim().length < MIN_PROGRAM_LENGTH) {
    warnings.push("Code is too short for a complex bot");
    penalty += 10;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - penalty),
  };
}
