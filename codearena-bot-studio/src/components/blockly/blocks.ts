import * as Blockly from 'blockly';

// Define the "Move Ahead" block
Blockly.Blocks['bot_ahead'] = {
    init: function () {
        this.appendValueInput('DISTANCE')
            .setCheck('Number')
            .appendField('Mover para frente');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('Move o robô para frente pela distância especificada.');
    }
};

// Define the "Turn" block
Blockly.Blocks['bot_turn'] = {
    init: function () {
        this.appendValueInput('DEGREES')
            .setCheck('Number')
            .appendField('Girar corpo');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('Gira o corpo do robô pelo número de graus especificado.');
    }
};

// Define the "Fire" block
Blockly.Blocks['bot_fire'] = {
    init: function () {
        this.appendValueInput('POWER')
            .setCheck('Number')
            .appendField('Atirar com força');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(0);
        this.setTooltip('Atira uma bala com o poder especificado (0.1 a 3.0).');
    }
};

// Define the "Activate Power" block
Blockly.Blocks['bot_activate_power'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('Ativar Módulo')
            .appendField(new Blockly.FieldDropdown([
                ['Escudo de Energia', 'SHIELD'],
                ['Overclock (Turbo)', 'OVERCLOCK'],
                ['Camuflagem', 'STEALTH']
            ]), 'POWER');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('Ativa um módulo tático especial.');
    }
};
