"use client";

import type { WorldState, RobotState } from '@/types';

interface StatsPanelProps {
    state: WorldState | null;
    status: string;
}

export function StatsPanel({ state, status }: StatsPanelProps) {
    const bots = state?.bots ?? [];
    const bullets = state?.bullets ?? [];

    return (
        <div className="p-4 border border-white/10 rounded bg-white/5 flex flex-col">
            <h3 className="font-bold mb-2">Stats</h3>
            <div className="text-xs text-gray-500 mb-2 font-mono">{status}</div>
            <div className="space-y-1 text-sm">
                <div>Tick: <span className="text-cyan-400 font-mono">{state?.tick ?? '-'}</span></div>
                <div>Bots: <span className="text-cyan-400">{bots.length}</span></div>
                <div>Bullets: <span className="text-amber-400">{bullets.length}</span></div>
            </div>
            {bots.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bots</div>
                    {bots.map((b: RobotState) => (
                        <div key={b.id} className="text-xs flex justify-between gap-2">
                            <span className="truncate">{b.name || b.id}</span>
                            <span className="text-cyan-400">Hull:{Math.round(b.hull ?? 0)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
