/**
 * Visit / view counter helpers.
 * All endpoints gracefully return 0 if Upstash env vars are not set.
 */

export async function trackVisit(): Promise<number> {
  try {
    const res = await $fetch<{ total: number; enabled: boolean }>('/api/stats/visit', {
      method: 'POST',
    })
    return res.total
  } catch {
    return 0
  }
}

export async function trackNoteView(slug: string): Promise<number> {
  try {
    const res = await $fetch<{ count: number; enabled: boolean }>(
      `/api/stats/note/${encodeURIComponent(slug)}`,
      { method: 'POST' },
    )
    return res.count
  } catch {
    return 0
  }
}

export async function fetchNoteCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {}
  try {
    const res = await $fetch<{ counts: Record<string, number>; enabled: boolean }>(
      '/api/stats/notes',
      { query: { slugs: slugs.join(',') } },
    )
    return res.counts
  } catch {
    return {}
  }
}
