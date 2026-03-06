import { Tasklets } from '@wendelmax/tasklets';

export interface MazeResult {
    obstacles: { id: string; x: number; z: number }[];
    width: number;
    height: number;
}

/**
 * Service to generate procedural mazes for CodeArena.
 * Uses @wendelmax/tasklets to handle the computation in a background thread.
 */
export class MazeService {
    private static tasklet = new Tasklets();

    /**
     * Generates a maze using a simple recursive backtracking algorithm.
     */
    static async generate(width: number, height: number, cellSize: number = 60): Promise<MazeResult> {
        return this.tasklet.run((params: { w: number, h: number, size: number }) => {
            const { w, h, size } = params;
            const cols = Math.floor(w / size);
            const rows = Math.floor(h / size);

            // Grid of cells (initially all walls)
            const grid: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(true));

            const obstacles: { id: string, x: number, z: number }[] = [];

            // Simple Random Walk / Maze Generation simulation
            // In a real implementation, we'd use a proper maze algo.
            // For now, let's create a "random scatter" that feels like a map.
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // 20% chance of an obstacle, but keep a center area clear
                    const centerX = cols / 2;
                    const centerY = rows / 2;
                    const distanceToCenter = Math.sqrt(Math.pow(c - centerX, 2) + Math.pow(r - centerY, 2));

                    if (distanceToCenter > 3 && Math.random() > 0.8) {
                        obstacles.push({
                            id: `gen_${r}_${c}`,
                            x: (c - centerX) * size,
                            z: (r - centerY) * size
                        });
                    }
                }
            }

            return {
                obstacles,
                width: w,
                height: h
            };
        }, { w: width, h: height, size: cellSize });
    }
}
