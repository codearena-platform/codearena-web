import type { Block, Workspace } from "blockly";
import { javascriptGenerator, Order, type JavascriptGenerator } from "blockly/javascript";
import { wrapBotActions } from "@/lib/botProgram";

export const generator = javascriptGenerator;

/**
 * Generate a complete bot program. Blocks only produce action statements, so
 * the shared contract wrapper puts them inside the onTick handler expected by
 * the validator and the SDK.
 */
export function generateBotCode(workspace: Workspace): string {
  return wrapBotActions(generator.workspaceToCode(workspace));
}

generator.forBlock["bot_ahead"] = function (block: Block, codeGenerator: JavascriptGenerator) {
  const distance = codeGenerator.valueToCode(block, "DISTANCE", Order.ATOMIC) || "0";
  return `bot.ahead(${distance});\n`;
};

generator.forBlock["bot_turn"] = function (block: Block, codeGenerator: JavascriptGenerator) {
  const degrees = codeGenerator.valueToCode(block, "DEGREES", Order.ATOMIC) || "0";
  return `bot.turn(${degrees});\n`;
};

generator.forBlock["bot_fire"] = function (block: Block, codeGenerator: JavascriptGenerator) {
  const power = codeGenerator.valueToCode(block, "POWER", Order.ATOMIC) || "1.0";
  return `bot.fire(${power});\n`;
};

generator.forBlock["bot_activate_power"] = function (block: Block) {
  const power = block.getFieldValue("POWER") ?? "SHIELD";
  return `bot.activatePower(PowerType.${power});\n`;
};
