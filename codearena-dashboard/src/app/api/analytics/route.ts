import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * API Route to process world state analytics using Node.js worker threads.
 * This demonstrates the integration of @wendelmax/tasklets in the dashboard backend.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Execute heavy processing in a background tasklet
        const summary = await AnalyticsService.summarizeState(body);

        return NextResponse.json(summary);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
