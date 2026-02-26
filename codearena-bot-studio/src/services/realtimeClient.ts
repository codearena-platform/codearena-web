export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface RealtimeClientCallbacks {
    onMessage: (data: unknown) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (event: Event) => void;
}

const HEARTBEAT_INTERVAL_MS = 30000;

function getWsBaseUrl(): string {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL;
    }
    return 'ws://localhost:8080';
}

export function createRealtimeClient(baseUrl?: string) {
    const resolved = baseUrl ?? getWsBaseUrl();
    let ws: WebSocket | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    function buildUrl(matchId: string): string {
        const url = new URL(resolved);
        url.pathname = `/ws/match/${matchId}`;
        return url.toString();
    }

    function connect(matchId: string, callbacks: RealtimeClientCallbacks): void {
        if (ws?.readyState === WebSocket.OPEN) {
            disconnect();
        }

        const url = buildUrl(matchId);
        ws = new WebSocket(url);

        ws.onopen = () => {
            heartbeatTimer = setInterval(() => {
                if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
            }, HEARTBEAT_INTERVAL_MS);
            callbacks.onOpen?.();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data?.type === 'pong') return;
                callbacks.onMessage(data);
            } catch {
                callbacks.onMessage(event.data);
            }
        };

        ws.onclose = () => {
            if (heartbeatTimer) {
                clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }
            callbacks.onClose?.();
        };

        ws.onerror = (e) => callbacks.onError?.(e);
    }

    function disconnect(): void {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
    }

    return { connect, disconnect };
}
