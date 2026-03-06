"use client";

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const BlocklyComponent = dynamic(
    () => import('@/components/blockly/BlocklyComponent').then((m) => m.default),
    { ssr: false, loading: () => <div className="h-[320px] bg-zinc-900/50 animate-pulse rounded" /> }
);

interface EditorPanelProps {
    onCodeChange?: (code: string) => void;
}

export function EditorPanel({ onCodeChange }: EditorPanelProps) {
    const [validation, setValidation] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);

    const handleInternalCodeChange = useCallback(async (code: string) => {
        setIsValidating(true);
        try {
            const resp = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const result = await resp.json();
            setValidation(result);
        } catch (err) {
            console.error('Validation failed', err);
        } finally {
            setIsValidating(false);
        }

        if (onCodeChange) onCodeChange(code);
    }, [onCodeChange]);

    return (
        <div className="p-4 border border-white/10 rounded bg-white/5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Editor (Blockly)</h3>
                {isValidating && <span className="text-xs text-cyan-400 animate-pulse">Validating...</span>}
                {validation && !isValidating && (
                    <span className={`text-xs ${validation.valid ? 'text-green-400' : 'text-red-400'}`}>
                        Score: {validation.score}/100
                    </span>
                )}
            </div>

            <div className="flex-1 min-h-[320px]">
                <BlocklyComponent onCodeChange={handleInternalCodeChange} />
            </div>

            {validation && validation.errors.length > 0 && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                    {validation.errors[0]}
                </div>
            )}
        </div>
    );
}
