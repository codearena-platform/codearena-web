"use client";

import { useState, useCallback, useMemo } from 'react';
import nextDynamic from 'next/dynamic';
import { useMatchStream } from '@/hooks/useMatchStream';
import { EditorPanel } from './EditorPanel';
import { ConsolePanel } from './ConsolePanel';
import type { LogEntry } from './ConsolePanel';
import { StatsPanel } from './StatsPanel';

const Arena3DDynamic = nextDynamic(
    () => import('@/components/Arena3D').then((m) => ({ default: m.Arena3D })),
    { ssr: false, loading: () => <div className="w-full h-[500px] bg-black/50 animate-pulse rounded-xl border border-white/10" /> }
);

const STATUS_LABELS: Record<string, string> = {
    idle: 'Idle',
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error'
};

const DEFAULT_MATCH_ID = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MATCH_ID) || 'demo-match-001';

export function BotStudioWorkspace() {
    const { state, status } = useMatchStream(DEFAULT_MATCH_ID);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const handleCodeChange = useCallback((code: string) => {
        const entry: LogEntry = {
            id: `log_${Date.now()}`,
            time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
            type: 'code',
            message: code ? `Code: ${code.trim().slice(0, 80)}${code.length > 80 ? '...' : ''}` : '(empty)'
        };
        setLogs((prev) => [...prev.slice(-49), entry]);
    }, []);

    const connectionLabel = useMemo(() => STATUS_LABELS[status] ?? status, [status]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
            <div className="lg:col-span-2">
                <section aria-label="Arena visualization">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
                        Arena (live feed)
                    </h2>
                    <Arena3DDynamic matchId={DEFAULT_MATCH_ID} state={state} status={status} />
                </section>
            </div>
            <div className="flex flex-col gap-4">
                <EditorPanel onCodeChange={handleCodeChange} />
                <ConsolePanel logs={logs} connectionStatus={connectionLabel} />
                <StatsPanel state={state} status={connectionLabel} />
            </div>
        </div>
    );
}
