"use client";

import { TraceViewer } from "@/components/TraceViewer";
import Link from "next/link";

export default function SystemPage() {
    return (
        <main className="flex flex-col items-center bg-[#0d0d0d] p-8 min-h-screen">
            <header className="z-10 w-full max-w-6xl flex justify-between items-center mb-10 border-b border-[#333] pb-6">
                <div>
                    <h1 className="text-3xl font-black text-[#00ffff] tracking-tighter uppercase italic">
                        Telemetry <span className="text-white">Dashboard</span>
                    </h1>
                    <p className="text-[#666] text-xs uppercase tracking-widest mt-1">Real-time OpenTelemetry span monitoring</p>
                </div>
                <Link
                    href="/dashboard"
                    className="px-4 py-2 border border-[#333] text-[#aaa] hover:text-white hover:border-[#555] transition-all text-xs font-bold uppercase"
                >
                    Back to Battle Control
                </Link>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TraceViewer />
                </div>

                <div className="space-y-6">
                    <div className="bg-[#111] border border-[#333] p-6 rounded-lg">
                        <h4 className="text-[#fff] text-xs font-bold uppercase tracking-widest mb-4">Service Health</h4>
                        <div className="space-y-3">
                            {[
                                { name: "Arena Engine", latency: "12ms", health: 98 },
                                { name: "Match Judge", latency: "45ms", health: 100 },
                                { name: "Platform API", latency: "8ms", health: 95 },
                                { name: "Tasklet Cluster", latency: "2ms", health: 100 },
                            ].map((s) => (
                                <div key={s.name} className="flex justify-between items-center">
                                    <span className="text-[#888] text-xs">{s.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#666] text-[10px]">{s.latency}</span>
                                        <span className="text-green-500 font-bold text-xs">{s.health}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-lg">
                        <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">OTel Status</h4>
                        <p className="text-[#777] text-[11px] leading-relaxed">
                            The distributed tracing system is currently collecting spans from all Go and Node.js microservices.
                            All timing data is calculated using high-resolution monotonic clocks.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="animate-pulse w-2 h-2 rounded-full bg-cyan-400"></div>
                            <span className="text-cyan-400 text-[10px] uppercase font-bold">Collector: Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
