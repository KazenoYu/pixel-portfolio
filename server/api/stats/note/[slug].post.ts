import { getRedis } from '~~/server/utils/redis'

/**
 * Increments view count for a single note. Throttled per-browser:
 * only count once per 6 hours per slug per browser.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const redis = getRedis()
  if (!redis) return { count: 0, enabled: false }

  const cookieName = `qn_n_${slug.replace(/[^a-z0-9-]/gi, '')}`
  const cookie = getCookie(event, cookieName)
  const now = Date.now()
  const THROTTLE_MS = 6 * 60 * 60 * 1000 // 6h

  let shouldIncrement = true
  if (cookie) {
    const last = Number(cookie)
    if (Number.isFinite(last) && now - last < THROTTLE_MS) {
      shouldIncrement = false
    }
  }

  const key = `stats:note:${slug}`
  const count = shouldIncrement
    ? await redis.incr(key)
    : ((await redis.get<number>(key)) ?? 0)

  if (shouldIncrement) {
    setCookie(event, cookieName, String(now), {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    })
  }

  return { count, enabled: true }
})
