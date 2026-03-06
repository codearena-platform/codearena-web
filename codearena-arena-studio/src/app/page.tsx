"use client";

import { useState, useCallback } from "react";
import ArenaCanvas, { type ObstacleData, type ArenaConfig } from "../components/arena/ArenaCanvas";

export default function Home() {
    const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
    const width = 800;
    const height = 600;

    const handleNewChallenge = useCallback(() => {
        setObstacles([]);
    }, []);

    const handleExport = useCallback(() => {
        const config: ArenaConfig = { width, height, obstacles };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `arena_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [obstacles]);

    const handleImport = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const config = JSON.parse(reader.result as string) as ArenaConfig;
                    if (config.obstacles && Array.isArray(config.obstacles)) {
                        setObstacles(config.obstacles.map((o) => ({ ...o, id: o.id || `obs_${Date.now()}_${Math.random().toString(36).slice(2)}` })));
                    }
                } catch (err) {
                    console.error("Invalid arena JSON", err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, []);

    const [isGenerating, setIsGenerating] = useState(false);
    const handleGenerateMaze = useCallback(async () => {
        setIsGenerating(true);
        try {
            const resp = await fetch('/api/generate-maze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ width, height, cellSize: 50 })
            });
            const data = await resp.json();
            if (data.obstacles) {
                setObstacles(data.obstacles);
            }
        } catch (err) {
            console.error("Maze generation failed", err);
        } finally {
            setIsGenerating(false);
        }
    }, [width, height]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d0d] p-8">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
                <h1 className="text-3xl font-black text-cyan-400 tracking-tighter uppercase italic">
                    CodeArena <span className="text-magenta-500">Studio</span>
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleNewChallenge}
                        className="px-4 py-2 border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all uppercase text-xs tracking-widest font-bold"
                    >
                        New Challenge
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 border border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-black transition-all uppercase text-xs tracking-widest font-bold"
                    >
                        Export JSON
                    </button>
                    <button
                        disabled={isGenerating}
                        onClick={handleGenerateMaze}
                        className={`px-4 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all uppercase text-xs tracking-widest font-bold ${isGenerating ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Maze'}
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-4 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black transition-all uppercase text-xs tracking-widest font-bold"
                    >
                        Import JSON
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <ArenaCanvas
                    width={width}
                    height={height}
                    obstacles={obstacles}
                    onObstaclesChange={setObstacles}
                />
                <p className="text-cyan-900 text-[10px] uppercase tracking-[0.3em] font-bold text-center">
                    Click: add obstacle | Right-click: remove obstacle | Deterministic Physics v1
                </p>
            </div>
        </main>
    );
}
