"use client";

import type { WorldState } from '@/types';

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface MatchHUDProps {
    state: WorldState | null;
    status: StreamStatus;
}

const STATUS_LABELS: Record<StreamStatus, string> = {
    idle: 'IDLE',
    connecting: 'CONNECTING...',
    connected: 'LIVE_FEED',
    disconnected: 'DISCONNECTED',
    error: 'ERROR',
};

export function MatchHUD({ state, status }: MatchHUDProps) {
    const label = STATUS_LABELS[status];
    const tick = state?.tick ?? 0;
    const objCount = state?.bots?.length ?? 0;

    return (
        <div className="absolute top-4 left-4 font-mono text-xs text-green-400 pointer-events-none z-10">
            <div className={status === 'connected' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-amber-400'}>
                {label}_V.1.0
            </div>
            <div>TICK: {tick}</div>
            <div>OBJS: {objCount}</div>
        </div>
    );
}
