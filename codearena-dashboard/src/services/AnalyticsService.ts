import { Tasklets } from '@wendelmax/tasklets';

export interface BattleStats {
    totalBots: number;
    activeBullets: number;
    averageHull: number;
    leaderId: string | null;
    intensityIndex: number; // Heuristic based on movement/firing
}

/**
 * Service to process complex battle snapshots in the background.
 * Uses @wendelmax/tasklets to ensure that heavy data transformations
 * don't saturate the Node.js event loop on the server-side (API/Streaming).
 */
export class AnalyticsService {
    private static tasklet = new Tasklets();

    /**
     * Processes a raw WorldState to extract high-level metrics.
     * Useful for historical aggregation or real-time dashboard summaries.
     */
    static async summarizeState(worldState: any): Promise<BattleStats> {
        return this.tasklet.run((state: any) => {
            const bots = state.bots ?? state.Bots ?? [];
            const bullets = state.bullets ?? state.Bullets ?? [];

            let totalHull = 0;
            let leaderId: string | null = null;
            let maxHull = -1;

            bots.forEach((bot: any) => {
                const hull = bot.hull ?? bot.Hull ?? 0;
                totalHull += hull;
                if (hull > maxHull) {
                    maxHull = hull;
                    leaderId = bot.id ?? bot.Id;
                }
            });

            const avgHull = bots.length > 0 ? totalHull / bots.length : 0;

            // Artificial "Intensity" calculation (CPU intensive simulation slice)
            let intensity = (bullets.length * 2) + bots.length;
            const iterations = 10000;
            for (let i = 0; i < iterations; i++) {
                intensity = Math.sqrt(intensity * 1.0001 + Math.random() * 0.0001);
            }

            return {
                totalBots: bots.length,
                activeBullets: bullets.length,
                averageHull: Math.round(avgHull),
                leaderId,
                intensityIndex: Math.round(intensity * 100) / 100
            };
        }, worldState);
    }
}
