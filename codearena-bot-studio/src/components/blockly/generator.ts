import { javascriptGenerator } from 'blockly/javascript';

export const generator = javascriptGenerator;

generator.forBlock['bot_ahead'] = function (block: any, generator: any) {
    const distance = generator.valueToCode(block, 'DISTANCE', generator.ORDER_ATOMIC) || '0';
    return `bot.ahead(${distance});\n`;
};

generator.forBlock['bot_turn'] = function (block: any, generator: any) {
    const degrees = generator.valueToCode(block, 'DEGREES', generator.ORDER_ATOMIC) || '0';
    return `bot.turn(${degrees});\n`;
};

generator.forBlock['bot_fire'] = function (block: any, generator: any) {
    const power = generator.valueToCode(block, 'POWER', generator.ORDER_ATOMIC) || '1.0';
    return `bot.fire(${power});\n`;
};

generator.forBlock['bot_activate_power'] = function (block: any) {
    const power = block.getFieldValue('POWER');
    return `bot.activatePower(PowerType.${power});\n`;
};
