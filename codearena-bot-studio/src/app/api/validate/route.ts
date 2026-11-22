import { createRateLimiter, handlePost, parseValidateRequest } from '../../../lib/apiSecurity'
import { BotValidatorService } from '../../../services/BotValidatorService'

const limiter = createRateLimiter(30, 60_000)

/** POST /api/validate - bounded source validation behind a per-IP limit. */
export function POST(request: Request): Promise<Response> {
  return handlePost(request, {
    limiter,
    maxBodyBytes: 128 * 1024,
    parse: parseValidateRequest,
    run: (code) => BotValidatorService.validateCode(code),
  })
}
