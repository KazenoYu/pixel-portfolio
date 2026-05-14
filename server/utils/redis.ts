import { Redis } from '@upstash/redis'

let cached: Redis | null = null
let warnedMissing = false

/**
 * Returns Upstash Redis client, or null if env vars are missing.
 * Caller must handle null (graceful fallback when stats backend unavailable).
 */
export function getRedis(): Redis | null {
  if (cached) return cached
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    if (!warnedMissing) {
      console.warn('[stats] UPSTASH_REDIS_REST_URL or _TOKEN not set — counter disabled.')
      warnedMissing = true
    }
    return null
  }
  cached = new Redis({ url, token })
  return cached
}
