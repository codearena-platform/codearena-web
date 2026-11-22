import { createRateLimiter, handlePost, parseAnalyticsRequest } from '../../../lib/apiSecurity'
import { AnalyticsService } from '../../../services/AnalyticsService'

const limiter = createRateLimiter(60, 60_000)

/** POST /api/analytics - bounded world snapshots behind a per-IP limit. */
export function POST(request: Request): Promise<Response> {
  return handlePost(request, {
    limiter,
    maxBodyBytes: 256 * 1024,
    parse: parseAnalyticsRequest,
    run: (worldState) => AnalyticsService.summarizeState(worldState),
  })
}
