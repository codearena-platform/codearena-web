import { NextResponse } from 'next/server';
import { MazeService } from '@/services/MazeService';

/**
 * API Route to generate procedural arenas using worker threads.
 */
export async function POST(request: Request) {
    try {
        const { width, height, cellSize } = await request.json();

        // Background computation via Tasklets
        const maze = await MazeService.generate(width, height, cellSize || 60);

        return NextResponse.json(maze);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
