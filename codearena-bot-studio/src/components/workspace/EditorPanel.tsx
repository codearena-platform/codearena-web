"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { normalizeBasePath, withBasePath } from '@codearena/ui';
import { normalizeValidationResponse, type ValidationResult } from '@/lib/validationResponse';

const BlocklyComponent = dynamic(
    () => import('@/components/blockly/BlocklyComponent').then((m) => m.default),
    { ssr: false, loading: () => <div className="h-[320px] bg-zinc-900/50 animate-pulse rounded" /> }
);

interface EditorPanelProps {
    onCodeChange?: (code: string) => void;
}

const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
const DEBOUNCE_MS = 300;

export function EditorPanel({ onCodeChange }: EditorPanelProps) {
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        abortRef.current?.abort();
    }, []);

    const handleInternalCodeChange = useCallback((code: string) => {
        onCodeChange?.(code);

        // Blockly fires on every keystroke: debounce and cancel in-flight requests.
        if (debounceRef.current) clearTimeout(debounceRef.current);
        abortRef.current?.abort();

        debounceRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;
            setIsValidating(true);
            try {
                const resp = await fetch(withBasePath('/api/validate', BASE_PATH), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                    signal: controller.signal,
                });
                const payload: unknown = await resp.json();
                setValidation(normalizeValidationResponse(resp.status, payload));
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setValidation(normalizeValidationResponse(0, null));
                }
            } finally {
                if (abortRef.current === controller) setIsValidating(false);
            }
        }, DEBOUNCE_MS);
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

            <div aria-live="polite">
                {validation?.errors.map((message, index) => (
                    <p key={`error-${index}`} className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                        {message}
                    </p>
                ))}
                {validation?.warnings.map((message, index) => (
                    <p key={`warning-${index}`} className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-300">
                        {message}
                    </p>
                ))}
            </div>
        </div>
    );
}
