import { createRateLimiter, handlePost, parseMazeRequest } from '../../../lib/apiSecurity'
import { MazeService } from '../../../services/MazeService'

const limiter = createRateLimiter(20, 60_000)

/** POST /api/generate-maze - bounded grid generation behind a per-IP limit. */
export function POST(request: Request): Promise<Response> {
  return handlePost(request, {
    limiter,
    maxBodyBytes: 4 * 1024,
    parse: parseMazeRequest,
    run: ({ width, height, cellSize }) => MazeService.generate(width, height, cellSize),
  })
}
