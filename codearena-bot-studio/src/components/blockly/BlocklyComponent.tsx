'use strict';

import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { generator } from './generator';
import './blocks';

interface BlocklyComponentProps {
  onCodeChange?: (code: string) => void;
}

const BlocklyComponent: React.FC<BlocklyComponentProps> = ({ onCodeChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (blocklyDiv.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: `
          <xml xmlns="https://developers.google.com/blockly/xml">
            <category name="Ações" colour="160">
              <block type="bot_ahead"></block>
              <block type="bot_turn"></block>
            </category>
            <category name="Combate" colour="0">
              <block type="bot_fire"></block>
              <block type="bot_activate_power"></block>
            </category>
            <category name="Lógica" colour="210">
              <block type="controls_if"></block>
              <block type="logic_compare"></block>
              <block type="logic_operation"></block>
              <block type="logic_boolean"></block>
            </category>
            <category name="Matemática" colour="230">
              <block type="math_number"></block>
              <block type="math_arithmetic"></block>
            </category>
          </xml>
        `,
      });

      workspace.current.addChangeListener(() => {
        const code = generator.workspaceToCode(workspace.current!);
        if (onCodeChange) {
          onCodeChange(code);
        }
      });
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
      }
    };
  }, [onCodeChange]);

  return <div ref={blocklyDiv} className="w-full h-full min-h-[500px]" />;
};

export default BlocklyComponent;
