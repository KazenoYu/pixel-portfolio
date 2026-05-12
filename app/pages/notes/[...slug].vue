<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('note-' + route.path, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Note not found', fatal: true })
}

const { data: siblings } = await useAsyncData('note-siblings', () => {
  return queryCollection('content')
    .where('path', 'LIKE', '/notes/%')
    .where('draft', '<>', true)
    .order('date', 'DESC')
    .all()
})

const idx = computed(() => siblings.value?.findIndex(n => n.path === route.path) ?? -1)
const prev = computed(() => idx.value > 0 ? siblings.value?.[idx.value - 1] : null)
const next = computed(() => {
  const list = siblings.value
  return list && idx.value >= 0 && idx.value < list.length - 1 ? list[idx.value + 1] : null
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useHead(() => ({
  title: page.value?.title ? `${page.value.title} — Quiet Notes` : 'Quiet Notes',
  meta: [{ name: 'description', content: page.value?.description || '' }],
}))
</script>

<template>
  <div class="px">
    <div class="frame">
      <header class="topbar">
        <NuxtLink to="/" class="brand">
          <span class="logo">▲</span>
          <span class="name">Quiet Notes</span>
        </NuxtLink>
        <nav>
          <NuxtLink to="/#notes">Notes</NuxtLink>
          <a href="#">Tags</a>
          <a href="#">About</a>
        </nav>
        <span v-if="page" class="reading-meta">
          <template v-if="page.readMin">{{ page.readMin }} min · </template>{{ page.date }}
        </span>
      </header>

      <!-- Small cozy banner -->
      <div class="banner">
        <svg viewBox="0 0 320 60" shape-rendering="crispEdges" preserveAspectRatio="none" class="banner-svg">
          <g fill="#f8f3e6">
            <rect x="50" y="8" width="22" height="2"/><rect x="48" y="10" width="26" height="2"/><rect x="54" y="12" width="18" height="2"/>
            <rect x="220" y="6" width="28" height="2"/><rect x="216" y="8" width="36" height="2"/>
          </g>
          <g fill="#a4c2a5">
            <rect x="0" y="38" width="60" height="22"/><rect x="50" y="34" width="80" height="26"/>
            <rect x="190" y="36" width="70" height="24"/><rect x="245" y="40" width="75" height="20"/>
          </g>
          <g fill="#6e9075">
            <rect x="22" y="34" width="6" height="20"/><rect x="18" y="36" width="14" height="6"/><rect x="20" y="42" width="10" height="6"/>
            <rect x="42" y="32" width="6" height="22"/><rect x="38" y="34" width="14" height="6"/>
            <rect x="270" y="34" width="6" height="20"/><rect x="266" y="36" width="14" height="6"/>
            <rect x="290" y="32" width="6" height="22"/><rect x="286" y="34" width="14" height="6"/>
          </g>
          <rect x="150" y="40" width="2" height="3" fill="#f3e8c6"/>
          <rect x="154" y="40" width="2" height="3" fill="#f3e8c6"/>
          <rect x="149" y="43" width="8" height="3" fill="#f3e8c6"/>
          <rect x="148" y="46" width="10" height="3" fill="#e57865"/>
        </svg>
      </div>

      <article class="article">
        <NuxtLink to="/#notes" class="back">
          <span class="back-arrow">←</span> Back to notes
        </NuxtLink>

        <header v-if="page" class="art-head">
          <div class="meta-top">
            <span v-if="idx >= 0" class="num-stamp">No.{{ String(idx + 1).padStart(2, '0') }}</span>
            <span class="dot"></span>
            <time v-if="page.date">{{ page.date }}</time>
            <template v-if="page.readMin">
              <span class="dot"></span>
              <span>{{ page.readMin }} min read</span>
            </template>
          </div>
          <h1>{{ page.title }}</h1>
          <p v-if="page.description" class="dek">{{ page.description }}</p>
          <div v-if="page.tags?.length" class="tags">
            <span v-for="t in page.tags" :key="t">{{ t }}</span>
          </div>
        </header>

        <div class="body-text">
          <ContentRenderer v-if="page" :value="page" />
        </div>

        <nav class="prev-next">
          <NuxtLink v-if="prev" :to="prev.path" class="pn-btn">
            <span class="dir">← prev</span>
            <span class="ttl">{{ prev.title }}</span>
          </NuxtLink>
          <span v-else class="pn-btn disabled">
            <span class="dir">← prev</span>
          </span>
          <NuxtLink to="/#notes" class="pn-btn home">↑ all notes</NuxtLink>
          <NuxtLink v-if="next" :to="next.path" class="pn-btn">
            <span class="dir">next →</span>
            <span class="ttl">{{ next.title }}</span>
          </NuxtLink>
          <span v-else class="pn-btn disabled">
            <span class="dir">next →</span>
          </span>
        </nav>
      </article>

      <footer class="ft">
        <div class="ft-left">
          <button class="logo-btn" @click="scrollToTop" aria-label="回到最上方">▲</button>
          <span>Quiet Notes · 2026 · 用 Vue 與一些耐心，慢慢長出來。</span>
        </div>
        <div class="ft-socials">
          <a href="#" aria-label="RSS" class="ic-link ic-rss"></a>
          <a href="#" aria-label="GitHub" class="ic-link ic-github"></a>
          <a href="#" aria-label="Twitter / X" class="ic-link ic-twitter"></a>
          <a href="#" aria-label="Email" class="ic-link ic-mail"></a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.px { background: #f5f7f4; min-height: 100vh; padding: 1.5rem; font-family: 'Pixelify Sans', 'VT323', 'JetBrains Mono', ui-monospace, monospace; color: #1f3329; }
.frame { max-width: 1100px; margin: 0 auto; background: #fffbf2; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 0 #1f3329, 0 0 0 3px #1f3329; }

/* topbar */
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; gap: 1.5rem; flex-wrap: wrap; background: rgba(248, 243, 230, 0.6); }
.brand { display: flex; align-items: center; gap: .5rem; font-weight: 600; text-decoration: none; color: inherit; }
.logo { color: #1f3329; font-size: 1.1rem; }
.name { font-size: 1rem; font-family: 'Pixelify Sans', sans-serif; }
.topbar nav { display: flex; gap: 1.5rem; flex: 1; justify-content: center; }
.topbar nav a { color: #1f3329; text-decoration: none; font-size: .95rem; font-weight: 500; position: relative; }
.topbar nav a:hover::after { content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: #e57865; }
.reading-meta { font-family: 'JetBrains Mono', monospace; font-size: .82rem; color: #4a6f5d; font-weight: 500; }

/* banner */
.banner { line-height: 0; }
.banner-svg { width: 100%; height: clamp(100px, 16vw, 160px); image-rendering: pixelated; display: block; }

/* article */
.article { background: #fffbf2; padding: 2rem 2rem 4rem; max-width: 720px; margin: 0 auto; font-family: 'DM Serif Display', Georgia, 'Noto Serif TC', serif; }
.back { display: inline-flex; align-items: center; gap: .35rem; background: rgba(151, 182, 173, 0.25); border: 2px solid #1f3329; border-radius: 999px; padding: 6px 14px; font: inherit; font-family: 'Pixelify Sans', sans-serif; font-size: .85rem; color: #1f3329; text-decoration: none; margin-bottom: 2rem; transition: transform .15s, background .15s, box-shadow .15s; box-shadow: 3px 3px 0 #1f3329; }
.back:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #1f3329; background: rgba(151, 182, 173, 0.45); }

.art-head { padding-bottom: 1.75rem; border-bottom: 2px dashed #97b6ad; margin-bottom: 2.5rem; }
.meta-top { display: flex; align-items: center; gap: .65rem; font-family: 'JetBrains Mono', monospace; font-size: .78rem; color: #4a6f5d; margin-bottom: 1rem; flex-wrap: wrap; }
.num-stamp { background: #1f3329; color: #f3e8c6; padding: 2px 8px; font-weight: 600; }
.meta-top .dot { width: 3px; height: 3px; background: #97b6ad; border-radius: 50%; }
.art-head h1 { font-family: 'DM Serif Display', Georgia, 'Noto Serif TC', serif; font-size: clamp(2rem, 5vw, 2.85rem); font-weight: 400; line-height: 1.15; letter-spacing: -.01em; color: #1f3329; margin: 0 0 1rem; }
.art-head .dek { font-family: 'Inter', system-ui, sans-serif; font-size: 1.1rem; line-height: 1.55; color: #2c4a3c; margin: 0 0 1.25rem; }
.art-head .tags { display: flex; flex-wrap: wrap; gap: .4rem; }
.art-head .tags span { font-family: 'JetBrains Mono', monospace; background: #97b6ad; color: #1f3329; border: 1.5px solid #1f3329; padding: 2px 9px; font-size: .72rem; font-weight: 600; }

/* prose body — readable, with pixel ornaments */
.body-text { font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif; font-size: 1.05rem; line-height: 1.85; color: #1f3329; }
.body-text :deep(p) { margin: 0 0 1.5rem; }
.body-text :deep(p:first-of-type::first-letter) { font-family: 'DM Serif Display', Georgia, serif; font-size: 4rem; font-weight: 400; float: left; line-height: .85; padding: .35rem .5rem 0 0; color: #e57865; }
.body-text :deep(blockquote p:first-of-type::first-letter),
.body-text :deep(li p:first-of-type::first-letter),
.body-text :deep(td p:first-of-type::first-letter) { font-size: inherit; font-weight: inherit; float: none; padding: 0; line-height: inherit; color: inherit; font-family: inherit; }

.body-text :deep(h1) { font-family: 'DM Serif Display', Georgia, 'Noto Serif TC', serif; font-size: 2rem; font-weight: 400; letter-spacing: -.01em; color: #1f3329; margin: 3rem 0 1rem; display: flex; align-items: center; gap: .75rem; }
.body-text :deep(h1)::before { content: ''; flex-shrink: 0; width: 14px; height: 14px; background: linear-gradient(#1f3329, #1f3329) 0 0 / 14px 4px no-repeat, linear-gradient(#1f3329, #1f3329) 0 10px / 14px 4px no-repeat, linear-gradient(#e57865, #e57865) 5px 5px / 4px 4px no-repeat; }

.body-text :deep(h2) { font-family: 'DM Serif Display', Georgia, 'Noto Serif TC', serif; font-size: 1.65rem; font-weight: 400; letter-spacing: -.01em; color: #1f3329; margin: 2.5rem 0 1rem; display: flex; align-items: center; gap: .75rem; }
.body-text :deep(h2)::before { content: ''; flex-shrink: 0; width: 12px; height: 12px; background: linear-gradient(#e57865, #e57865) 0 0 / 4px 4px no-repeat, linear-gradient(#e57865, #e57865) 8px 0 / 4px 4px no-repeat, linear-gradient(#e57865, #e57865) 0 8px / 4px 4px no-repeat, linear-gradient(#e57865, #e57865) 8px 8px / 4px 4px no-repeat, linear-gradient(#1f3329, #1f3329) 4px 4px / 4px 4px no-repeat; }

.body-text :deep(h3) { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.3rem; font-weight: 400; color: #1f3329; margin: 2rem 0 .75rem; display: flex; align-items: center; gap: .5rem; }
.body-text :deep(h3)::before { content: ''; flex-shrink: 0; width: 10px; height: 10px; background: linear-gradient(#97b6ad, #97b6ad) 0 4px / 10px 2px no-repeat, linear-gradient(#97b6ad, #97b6ad) 4px 0 / 2px 10px no-repeat; }

.body-text :deep(a) { color: #1f3329; text-decoration: underline; text-decoration-color: #e57865; text-decoration-thickness: 2px; text-underline-offset: 3px; font-weight: 500; }
.body-text :deep(a:hover) { background: rgba(229, 120, 101, 0.15); }
.body-text :deep(strong) { font-weight: 700; }
.body-text :deep(em) { font-style: italic; color: #4a6f5d; }

.body-text :deep(code) { font-family: 'JetBrains Mono', monospace; font-size: .9em; background: rgba(151, 182, 173, 0.3); color: #1f3329; padding: 1px 8px; border: 1.5px solid #97b6ad; font-weight: 500; word-break: break-word; }

.body-text :deep(pre) { position: relative; background: #1f3329; color: #f3e8c6; padding: 2.25rem 1.5rem 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: .9rem; margin: 1.75rem 0; overflow-x: auto; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #97b6ad; }
.body-text :deep(pre)::before { position: absolute; top: 0; left: 0; background: #e57865; color: #fffbf2; font-family: 'Pixelify Sans', sans-serif; font-size: .78rem; letter-spacing: .05em; padding: 3px 12px 4px; font-weight: 500; }
.body-text :deep(pre):has(code.language-bash)::before { content: 'Bash'; }
.body-text :deep(pre):has(code.language-sh)::before { content: 'Sh'; }
.body-text :deep(pre):has(code.language-js)::before { content: 'JS'; }
.body-text :deep(pre):has(code.language-jsx)::before { content: 'JSX'; }
.body-text :deep(pre):has(code.language-ts)::before { content: 'TS'; }
.body-text :deep(pre):has(code.language-tsx)::before { content: 'TSX'; }
.body-text :deep(pre):has(code.language-vue)::before { content: 'Vue'; }
.body-text :deep(pre):has(code.language-json)::before { content: 'JSON'; }
.body-text :deep(pre):has(code.language-yaml)::before { content: 'YAML'; }
.body-text :deep(pre):has(code.language-yml)::before { content: 'YML'; }
.body-text :deep(pre):has(code.language-md)::before { content: 'MD'; }
.body-text :deep(pre):has(code.language-mdc)::before { content: 'MDC'; }
.body-text :deep(pre):has(code.language-html)::before { content: 'HTML'; }
.body-text :deep(pre):has(code.language-css)::before { content: 'CSS'; }
.body-text :deep(pre):has(code.language-py)::before { content: 'Py'; }
.body-text :deep(pre):has(code.language-python)::before { content: 'Python'; }
.body-text :deep(pre code) { background: transparent; border: none; padding: 0; color: inherit; font-weight: 400; }
.body-text :deep(pre .line) { display: block; min-height: 1em; }

.body-text :deep(blockquote) { margin: 2rem 0; padding: 1.5rem 1.5rem 1.5rem 1.75rem; background: #f3e8c6; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #97b6ad; font-family: 'DM Serif Display', Georgia, serif; font-style: italic; font-size: 1.2rem; line-height: 1.55; color: #1f3329; }
.body-text :deep(blockquote p) { margin: 0; }

.body-text :deep(ul), .body-text :deep(ol) { margin: 1.25rem 0; padding-left: 1.5rem; font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif; }
.body-text :deep(li) { margin-bottom: .5rem; }
.body-text :deep(li::marker) { font-weight: 700; color: #e57865; }
.body-text :deep(hr) { border: none; border-top: 3px dashed #97b6ad; margin: 3rem 0; }
.body-text :deep(table) { width: 100%; border-collapse: collapse; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #97b6ad; margin: 1.5rem 0 2rem; }
.body-text :deep(th) { background: #1f3329; color: #f3e8c6; border: 2px solid #1f3329; padding: 8px 12px; text-align: left; font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: .85rem; }
.body-text :deep(td) { border: 1.5px solid #97b6ad; padding: 8px 12px; font-size: .9rem; font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif; }
.body-text :deep(img) { max-width: 100%; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #97b6ad; margin: 1.5rem 0; }

/* prev/next */
.prev-next { display: grid; grid-template-columns: 1fr auto 1fr; gap: .75rem; margin-top: 3rem; padding-top: 2rem; border-top: 2px dashed #97b6ad; }
.pn-btn { background: #f5efe0; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #1f3329; padding: .75rem 1rem; font: inherit; font-family: 'Inter', sans-serif; text-align: left; cursor: pointer; color: inherit; text-decoration: none; display: flex; flex-direction: column; gap: .25rem; transition: transform .15s, box-shadow .15s; }
.pn-btn:nth-child(3) { text-align: right; align-items: flex-end; }
.pn-btn:hover:not(.disabled) { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #1f3329; }
.pn-btn.disabled { opacity: .35; cursor: not-allowed; box-shadow: 2px 2px 0 #1f3329; }
.pn-btn .dir { font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; letter-spacing: .05em; }
.pn-btn .ttl { font-size: .9rem; color: #1f3329; font-weight: 500; }
.pn-btn.home { align-self: center; background: #1f3329; color: #f3e8c6; text-align: center; display: block; font-family: 'Pixelify Sans', sans-serif; padding: .85rem 1.25rem; font-size: .85rem; }

/* footer */
.ft { background: #1f3329; color: #d8e4dc; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; font-family: 'JetBrains Mono', monospace; font-size: .78rem; }
.ft-left { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; color: #d8e4dc; }
.logo-btn { background: transparent; border: none; padding: 0; cursor: pointer; color: inherit; font: inherit; line-height: 1; transition: color .15s, transform .15s; }
.logo-btn:hover { color: #e57865; transform: translateY(-2px); }
.ft-socials { display: flex; gap: .65rem; align-items: center; }
.ic-link { display: inline-block; width: 16px; height: 16px; background-color: #d8e4dc; -webkit-mask-size: 16px 16px; mask-size: 16px 16px; -webkit-mask-position: center; mask-position: center; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; transition: background-color .15s, transform .15s; }
.ic-link:hover { background-color: #e57865; transform: translateY(-2px); }
.ic-rss { -webkit-mask-image: url('https://unpkg.com/pixelarticons@latest/svg/rss.svg'); mask-image: url('https://unpkg.com/pixelarticons@latest/svg/rss.svg'); }
.ic-mail { -webkit-mask-image: url('https://unpkg.com/pixelarticons@latest/svg/mail.svg'); mask-image: url('https://unpkg.com/pixelarticons@latest/svg/mail.svg'); }
.ic-github { -webkit-mask-image: url('https://cdn.simpleicons.org/github'); mask-image: url('https://cdn.simpleicons.org/github'); }
.ic-twitter { -webkit-mask-image: url('https://cdn.simpleicons.org/x'); mask-image: url('https://cdn.simpleicons.org/x'); }

@media (max-width: 700px) {
  .topbar nav { order: 3; flex-basis: 100%; justify-content: flex-start; }
  .prev-next { grid-template-columns: 1fr; }
}
</style>
