"use client";

import { useRef, useEffect } from 'react';

export interface LogEntry {
    id: string;
    time: string;
    type: 'info' | 'warn' | 'error' | 'code';
    message: string;
}

interface ConsolePanelProps {
    logs: LogEntry[];
    connectionStatus: string;
}

export function ConsolePanel({ logs, connectionStatus }: ConsolePanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [logs]);

    const typeColor = (t: LogEntry['type']) => {
        switch (t) {
            case 'error': return 'text-red-400';
            case 'warn': return 'text-amber-400';
            case 'code': return 'text-cyan-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="p-4 border border-white/10 rounded bg-white/5 flex flex-col">
            <h3 className="font-bold mb-2">Console</h3>
            <div className="text-xs text-gray-500 mb-1 font-mono">{connectionStatus}</div>
            <div
                ref={scrollRef}
                className="flex-1 min-h-[120px] max-h-[160px] overflow-y-auto bg-black/40 rounded p-2 font-mono text-xs"
            >
                {logs.length === 0 ? (
                    <span className="text-gray-500">No logs yet. Edit blocks to see generated code.</span>
                ) : (
                    logs.map((l) => (
                        <div key={l.id} className={`py-0.5 ${typeColor(l.type)}`}>
                            <span className="text-gray-600">[{l.time}]</span> {l.message}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
