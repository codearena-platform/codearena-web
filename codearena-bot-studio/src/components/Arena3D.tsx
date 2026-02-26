"use client";

import { useMatchStream } from '@/hooks/useMatchStream';
import { ArenaScene } from './arena/ArenaScene';
import { MatchHUD } from './hud/MatchHUD';
import type { WorldState } from '@/types';

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface Arena3DProps {
    matchId: string;
    state?: WorldState | null;
    status?: StreamStatus;
}

export function Arena3D({ matchId, state: stateProp, status: statusProp }: Arena3DProps) {
    const hasExternalState = stateProp !== undefined && statusProp !== undefined;
    const stream = useMatchStream(hasExternalState ? '' : matchId);
    const state = hasExternalState ? stateProp! : stream.state;
    const status = hasExternalState ? statusProp! : stream.status;

    return (
        <div className="w-full h-[600px] bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
            {status === 'connecting' && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 font-mono animate-pulse z-20">
                    CONNECTING_TO_SIMULATION_BRIDGE...
                </div>
            )}

            <ArenaScene state={state} />

            <MatchHUD state={state} status={status} />
        </div>
    );
}
