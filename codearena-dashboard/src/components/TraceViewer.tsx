"use client";

import { useState, useEffect } from "react";

interface Span {
    name: string;
    duration: number;
    status: "success" | "warning" | "error";
    timestamp: string;
}

interface Trace {
    id: string;
    service: string;
    operation: string;
    spans: Span[];
    totalDuration: number;
}

export function TraceViewer() {
    const [traces, setTraces] = useState<Trace[]>([]);

    useEffect(() => {
        // Simulated OTel Trace Data
        const generateTrace = () => {
            const id = Math.random().toString(36).substring(2, 9).toUpperCase();
            const services = ["platform-api", "arena-engine", "bot-validator", "match-judge"];
            const operations = ["processBattleTick", "validateCode", "calculatePhysics", "updateScoreboard"];

            const service = services[Math.floor(Math.random() * services.length)];
            const operation = operations[Math.floor(Math.random() * operations.length)];

            const spans: Span[] = [
                { name: "Auth", duration: 5 + Math.random() * 10, status: "success", timestamp: new Date().toISOString() },
                { name: "DBQuery", duration: 20 + Math.random() * 50, status: Math.random() > 0.9 ? "warning" : "success", timestamp: new Date().toISOString() },
                { name: operation, duration: 100 + Math.random() * 200, status: Math.random() > 0.95 ? "error" : "success", timestamp: new Date().toISOString() },
            ];

            const newTrace: Trace = {
                id,
                service,
                operation,
                spans,
                totalDuration: spans.reduce((acc, s) => acc + s.duration, 0)
            };

            setTraces(prev => [newTrace, ...prev].slice(0, 15));
        };

        const interval = setInterval(generateTrace, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-6 font-mono text-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#00ffff] font-black tracking-widest uppercase">System Distributed Tracing</h3>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Live</span>
                </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {traces.map((trace) => (
                    <div key={trace.id} className="border-l-2 border-[#00ffff] bg-[#111] p-4 rounded-r-md hover:bg-[#161616] transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-[#888] text-[10px]">ID: {trace.id}</span>
                                <div className="text-white font-bold">{trace.service} <span className="text-[#555]">::</span> {trace.operation}</div>
                            </div>
                            <div className="text-[#00ffff] font-bold">{trace.totalDuration.toFixed(2)}ms</div>
                        </div>

                        <div className="flex gap-1 h-2 w-full bg-[#222] rounded-full overflow-hidden mt-2">
                            {trace.spans.map((span, i) => (
                                <div
                                    key={i}
                                    style={{ width: `${(span.duration / trace.totalDuration) * 100}%` }}
                                    className={`${span.status === 'success' ? 'bg-cyan-500/50' : span.status === 'warning' ? 'bg-yellow-500/50' : 'bg-red-500/50'}`}
                                    title={`${span.name}: ${span.duration.toFixed(2)}ms`}
                                />
                            ))}
                        </div>

                        <div className="mt-3 flex gap-4 text-[10px]">
                            {trace.spans.map((span, i) => (
                                <div key={i} className="flex items-center gap-1 opacity-60">
                                    <span className={`w-1.5 h-1.5 rounded-full ${span.status === 'success' ? 'bg-cyan-400' : span.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                                    {span.name} ({span.duration.toFixed(0)}ms)
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
}
