import { Tasklets } from '@wendelmax/tasklets';
import { analyzeBotProgram, type BotProgramAnalysis } from '@/lib/botProgram';

export type ValidationResult = BotProgramAnalysis;

/**
 * Service to validate bot code in a separate thread using @wendelmax/tasklets.
 * The pure analysis rules live in `@/lib/botProgram` and are shared with the
 * Blockly generator contract.
 */
export class BotValidatorService {
    private static tasklet = new Tasklets();

    static async validateCode(code: string): Promise<ValidationResult> {
        return this.tasklet.run((source: string) => analyzeBotProgram(source), code);
    }
}
