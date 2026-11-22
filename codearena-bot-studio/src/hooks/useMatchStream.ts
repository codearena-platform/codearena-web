"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { createRealtimeClient } from '@/services/realtimeClient';
import type { WorldState } from '@/types';

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export function useMatchStream(matchId: string) {
    const [state, setState] = useState<WorldState | null>(null);
    const [status, setStatus] = useState<StreamStatus>('idle');
    const clientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);

    const handleMessage = useCallback((data: unknown) => {
        const parsed = data as WorldState;
        if (parsed && typeof parsed.tick === 'number') {
            setState(parsed);
        }
    }, []);

    useEffect(() => {
        if (!matchId) return;

        let active = true;
        // Defer so subscribing to the external stream is not followed by a
        // synchronous cascading render.
        queueMicrotask(() => { if (active) setStatus('connecting'); });
        const client = createRealtimeClient();
        clientRef.current = client;

        client.connect(matchId, {
            onMessage: handleMessage,
            onOpen: () => setStatus('connected'),
            onClose: () => setStatus('disconnected'),
            onError: () => setStatus('error'),
        });

        return () => {
            active = false;
            client.disconnect();
            clientRef.current = null;
        };
    }, [matchId, handleMessage]);

    // Derive the idle values directly instead of setting state in an effect.
    return matchId ? { state, status } : { state: null, status: 'idle' as StreamStatus };
}
