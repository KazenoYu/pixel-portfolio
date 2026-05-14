export default defineEventHandler(async (event) => {
  const siteUrl = 'https://pixel-portfolio-seven.vercel.app'

  // @ts-ignore - queryCollection is auto-imported by @nuxt/content in server context
  const notes = await queryCollection(event, 'content')
    .where('path', 'LIKE', '/notes/%')
    .where('draft', '<>', true)
    .order('date', 'DESC')
    .all()

  const items = notes.map((n: any) => {
    const url = `${siteUrl}${n.path}`
    const date = n.date ? new Date(n.date).toUTCString() : new Date().toUTCString()
    return `
    <item>
      <title><![CDATA[${n.title ?? ''}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description><![CDATA[${n.description ?? ''}]]></description>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Quiet Notes</title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>學習紀錄、技術探索、AI 協作實踐。一座給技術筆記的小森林。</description>
    <language>zh-TW</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=600, s-maxage=3600')
  return xml
})
