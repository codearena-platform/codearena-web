"use client";

import dynamic from 'next/dynamic';

const BlocklyComponent = dynamic(
    () => import('@/components/blockly/BlocklyComponent').then((m) => m.default),
    { ssr: false, loading: () => <div className="h-[320px] bg-zinc-900/50 animate-pulse rounded" /> }
);

interface EditorPanelProps {
    onCodeChange?: (code: string) => void;
}

export function EditorPanel({ onCodeChange }: EditorPanelProps) {
    return (
        <div className="p-4 border border-white/10 rounded bg-white/5 flex flex-col h-full">
            <h3 className="font-bold mb-2">Editor (Blockly)</h3>
            <div className="flex-1 min-h-[320px]">
                <BlocklyComponent onCodeChange={onCodeChange} />
            </div>
        </div>
    );
}
