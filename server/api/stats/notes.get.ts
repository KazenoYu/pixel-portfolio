import { getRedis } from '~~/server/utils/redis'

/**
 * Returns a map of { slug: viewCount } for all note slugs provided via query string.
 * Usage: GET /api/stats/notes?slugs=foo,bar,baz
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const slugsRaw = String(query.slugs ?? '')
  const slugs = slugsRaw.split(',').map(s => s.trim()).filter(Boolean)

  if (slugs.length === 0) return { counts: {}, enabled: false }

  const redis = getRedis()
  if (!redis) return { counts: {}, enabled: false }

  const keys = slugs.map(s => `stats:note:${s}`)
  const values = await redis.mget<(number | null)[]>(...keys)
  const counts: Record<string, number> = {}
  slugs.forEach((slug, i) => {
    counts[slug] = values[i] ?? 0
  })

  return { counts, enabled: true }
})
