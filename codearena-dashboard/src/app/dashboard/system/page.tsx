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
                    <p className="text-[#666] text-xs uppercase tracking-widest mt-1">Demo telemetry - simulated data, no live collector</p>
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
                        <h4 className="text-[#fff] text-xs font-bold uppercase tracking-widest mb-4">Service Health (demo data)</h4>
                        <p className="text-[#666] text-[10px] mb-4">Static example values - not measured from running services.</p>
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
                        <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">OTel Status (demo)</h4>
                        <p className="text-[#777] text-[11px] leading-relaxed">
                            This page is a UI preview. No OpenTelemetry collector is connected, and every value shown here
                            is simulated or static example data. Connect a real collector before treating any number as telemetry.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-yellow-400 text-[10px] uppercase font-bold">Collector: not connected (demo)</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
