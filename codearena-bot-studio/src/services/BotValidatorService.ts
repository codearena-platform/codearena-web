import { Tasklets } from '@wendelmax/tasklets';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
}

/**
 * Service to validate bot code in a separate thread using @wendelmax/tasklets.
 * This prevents blocking the main thread during complex static analysis or simulations.
 */
export class BotValidatorService {
    private static tasklet = new Tasklets();

    /**
     * Highly intensive validation logic.
     * In a real scenario, this would include AST parsing, security checks, and heuristics.
     */
    static async validateCode(code: string): Promise<ValidationResult> {
        return this.tasklet.run(async (code: string) => {
            const errors: string[] = [];
            const warnings: string[] = [];
            let score = 100;

            // Simple heuristic checks (Simulating intensive CPU work)
            if (code.includes('while(true)')) {
                errors.push('Infinite loop detected');
                score -= 50;
            }

            if (code.length < 50) {
                warnings.push('Code is too short for a complex bot');
                score -= 10;
            }

            if (!code.includes('onTick') && !code.includes('onMessage')) {
                errors.push('No event handlers found (onTick/onMessage)');
                score -= 30;
            }

            // No artificial busy-wait: an unauthenticated caller could otherwise
            // saturate a worker thread for the whole delay on every request.

            return {
                valid: errors.length === 0,
                errors,
                warnings,
                score: Math.max(0, score)
            };
        }, code);
    }
}
