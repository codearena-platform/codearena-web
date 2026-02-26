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
        if (!matchId) {
            setStatus('idle');
            setState(null);
            return;
        }

        setStatus('connecting');
        const client = createRealtimeClient();
        clientRef.current = client;

        client.connect(matchId, {
            onMessage: handleMessage,
            onOpen: () => setStatus('connected'),
            onClose: () => setStatus('disconnected'),
            onError: () => setStatus('error'),
        });

        return () => {
            client.disconnect();
            clientRef.current = null;
            setStatus('disconnected');
        };
    }, [matchId, handleMessage]);

    return { state, status };
}
