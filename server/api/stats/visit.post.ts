import { getRedis } from '~~/server/utils/redis'

/**
 * Increments total site visits. Uses a cookie to throttle per-browser:
 * only increment once per 12 hours per browser.
 */
export default defineEventHandler(async (event) => {
  const redis = getRedis()
  if (!redis) return { total: 0, enabled: false }

  const cookie = getCookie(event, 'qn_visited')
  const now = Date.now()
  const THROTTLE_MS = 12 * 60 * 60 * 1000 // 12h

  let shouldIncrement = true
  if (cookie) {
    const last = Number(cookie)
    if (Number.isFinite(last) && now - last < THROTTLE_MS) {
      shouldIncrement = false
    }
  }

  const total = shouldIncrement
    ? await redis.incr('stats:total_visits')
    : ((await redis.get<number>('stats:total_visits')) ?? 0)

  if (shouldIncrement) {
    setCookie(event, 'qn_visited', String(now), {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    })
  }

  return { total, enabled: true }
})
