import { NextResponse } from 'next/server';
import { BotValidatorService } from '@/services/BotValidatorService';

/**
 * API Route to validate bot code using Node.js worker threads via @wendelmax/tasklets.
 * This keeps the heavy analysis off the main thread and the browser bundle.
 */
export async function POST(request: Request) {
    try {
        const { code } = await request.json();
        const result = await BotValidatorService.validateCode(code);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
