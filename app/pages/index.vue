<script setup lang="ts">
const { data: notes } = await useAsyncData('home-notes', () => {
  return queryCollection('content')
    .where('path', 'LIKE', '/notes/%')
    .where('draft', '<>', true)
    .order('date', 'DESC')
    .limit(12)
    .all()
})

const entering = ref(false)
const pageY = ref(0)
const scrolled = computed(() => pageY.value > 80)
const showStickyBunny = computed(() => pageY.value > 200)

function scrollToNotes() {
  document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function enterForest() {
  if (entering.value) return
  entering.value = true
  setTimeout(() => scrollToNotes(), 500)
  setTimeout(() => { entering.value = false }, 1200)
}

onMounted(() => {
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      pageY.value = window.scrollY
      ticking = false
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
})

useHead({
  title: 'Quiet Notes — 慢慢長出來的學習紀錄',
  meta: [
    { name: 'description', content: '一座給技術筆記的小森林。Vue 工程師的學習紀錄、踩坑筆記、與 AI 協作的實踐。' },
  ],
})
</script>

<template>
  <div class="px">
    <!-- Sticky bunny companion -->
    <aside class="sticky-bunny" :class="{ visible: showStickyBunny }" aria-hidden="true">
      <svg viewBox="0 0 16 16" shape-rendering="crispEdges">
        <rect x="4" y="1" width="2" height="3" fill="#f3e8c6"/>
        <rect x="8" y="1" width="2" height="3" fill="#f3e8c6"/>
        <rect x="3" y="4" width="2" height="2" fill="#f3e8c6"/>
        <rect x="9" y="4" width="2" height="2" fill="#f3e8c6"/>
        <rect x="3" y="6" width="8" height="4" fill="#f3e8c6"/>
        <rect x="5" y="7" width="1" height="1" fill="#1f3329"/>
        <rect x="8" y="7" width="1" height="1" fill="#1f3329"/>
        <rect x="2" y="10" width="10" height="4" fill="#e57865"/>
        <rect x="2" y="14" width="2" height="2" fill="#f3e8c6"/>
        <rect x="10" y="14" width="2" height="2" fill="#f3e8c6"/>
      </svg>
    </aside>

    <div class="frame">
      <header class="topbar" :class="{ scrolled }">
        <button class="brand brand-btn" @click="scrollToTop">
          <span class="logo">▲</span>
          <span class="name">Quiet Notes</span>
        </button>
        <nav>
          <a href="#notes" @click.prevent="scrollToNotes">Notes</a>
          <a href="#">Tags</a>
          <a href="#">About</a>
        </nav>
        <button class="cta-mini">Subscribe →</button>
      </header>

      <section class="hero">
        <h1>Where Calm Meets <br />Curiosity.</h1>
        <p class="lede">
          學習過後，靜靜把它寫下來。<br />
          一座給技術筆記的小森林。
        </p>

        <div class="features">
          <div class="feat">
            <div class="ico">
              <svg viewBox="0 0 16 16" shape-rendering="crispEdges">
                <rect x="3" y="2" width="10" height="12" fill="#1f3329"/>
                <rect x="4" y="3" width="8" height="10" fill="#f3e8c6"/>
                <rect x="5" y="5" width="6" height="1" fill="#1f3329"/>
                <rect x="5" y="7" width="6" height="1" fill="#1f3329"/>
                <rect x="5" y="9" width="4" height="1" fill="#1f3329"/>
              </svg>
            </div>
            <h3>Living Notes</h3>
            <p>每一篇都是活的，會隨著理解深化而長大。</p>
          </div>
          <div class="feat">
            <div class="ico">
              <svg viewBox="0 0 16 16" shape-rendering="crispEdges">
                <rect x="6" y="2" width="4" height="2" fill="#e57865"/>
                <rect x="5" y="4" width="6" height="2" fill="#e57865"/>
                <rect x="4" y="6" width="8" height="6" fill="#e57865"/>
                <rect x="3" y="8" width="10" height="3" fill="#e57865"/>
                <rect x="7" y="12" width="2" height="2" fill="#1f3329"/>
              </svg>
            </div>
            <h3>Slow & Honest</h3>
            <p>不追熱度，只記真實踩過的坑與想通的事。</p>
          </div>
          <div class="feat">
            <div class="ico">
              <svg viewBox="0 0 16 16" shape-rendering="crispEdges">
                <rect x="7" y="2" width="2" height="3" fill="#6e9075"/>
                <rect x="5" y="4" width="6" height="2" fill="#6e9075"/>
                <rect x="4" y="6" width="8" height="2" fill="#a4c2a5"/>
                <rect x="3" y="8" width="10" height="2" fill="#6e9075"/>
                <rect x="7" y="10" width="2" height="4" fill="#4a6f5d"/>
              </svg>
            </div>
            <h3>Quiet Reminders</h3>
            <p>讓筆記成為走累時可以坐下來歇息的地方。</p>
          </div>
        </div>

        <div class="enter-wrap">
          <button class="enter-btn" @click="enterForest" :disabled="entering">
            <span class="enter-arrow">→</span>
            <span>走進森林</span>
          </button>
        </div>
      </section>

      <div class="scene" :class="{ entering }">
        <svg viewBox="0 0 320 100" shape-rendering="crispEdges" preserveAspectRatio="none" class="bg-svg">
          <g class="cloud cloud-a" fill="#f8f3e6">
            <rect x="40" y="10" width="22" height="3"/><rect x="38" y="13" width="26" height="3"/><rect x="44" y="16" width="20" height="3"/>
          </g>
          <g class="cloud cloud-b" fill="#f8f3e6">
            <rect x="200" y="6" width="30" height="3"/><rect x="196" y="9" width="38" height="3"/><rect x="200" y="12" width="32" height="3"/>
          </g>
          <g class="cloud cloud-c" fill="#f8f3e6">
            <rect x="120" y="20" width="20" height="2"/><rect x="118" y="22" width="24" height="2"/>
          </g>
          <g fill="#a4c2a5">
            <rect x="0" y="55" width="40" height="20"/><rect x="35" y="50" width="50" height="25"/><rect x="80" y="58" width="40" height="17"/>
            <rect x="200" y="52" width="60" height="23"/><rect x="255" y="56" width="65" height="19"/>
          </g>
          <g fill="#6e9075">
            <rect x="10" y="50" width="6" height="20"/>
            <rect x="22" y="48" width="6" height="22"/>
            <rect x="36" y="52" width="6" height="18"/>
            <rect x="50" y="48" width="6" height="22"/>
            <rect x="240" y="50" width="6" height="20"/>
            <rect x="254" y="46" width="6" height="24"/>
            <rect x="268" y="50" width="6" height="20"/>
            <rect x="282" y="48" width="6" height="22"/>
            <rect x="296" y="52" width="6" height="18"/>
          </g>
          <g class="canopy canopy-left" fill="#6e9075">
            <rect x="6" y="52" width="14" height="6"/><rect x="8" y="58" width="10" height="6"/>
            <rect x="18" y="50" width="14" height="6"/><rect x="20" y="56" width="10" height="6"/>
            <rect x="32" y="54" width="14" height="6"/>
            <rect x="46" y="50" width="14" height="6"/><rect x="48" y="56" width="10" height="6"/>
          </g>
          <g class="canopy canopy-right" fill="#6e9075">
            <rect x="236" y="52" width="14" height="6"/><rect x="238" y="58" width="10" height="6"/>
            <rect x="250" y="48" width="14" height="6"/><rect x="252" y="54" width="10" height="6"/>
            <rect x="264" y="52" width="14" height="6"/>
            <rect x="278" y="50" width="14" height="6"/>
            <rect x="292" y="54" width="14" height="6"/>
          </g>
          <rect x="0" y="70" width="320" height="2" fill="#4a6f5d"/>
          <rect x="0" y="72" width="320" height="28" fill="#97b6ad"/>
          <g class="ripples ripples-a" fill="#a8c2bb" opacity=".7">
            <rect x="20" y="78" width="8" height="1"/><rect x="50" y="82" width="6" height="1"/><rect x="90" y="80" width="10" height="1"/>
            <rect x="170" y="82" width="6" height="1"/><rect x="260" y="80" width="8" height="1"/>
          </g>
          <g class="ripples ripples-b" fill="#a8c2bb" opacity=".5">
            <rect x="130" y="86" width="8" height="1"/><rect x="210" y="88" width="10" height="1"/>
            <rect x="35" y="90" width="6" height="1"/><rect x="290" y="84" width="6" height="1"/>
          </g>
          <g fill="#7a5c3e">
            <rect x="100" y="68" width="40" height="3"/><rect x="105" y="71" width="2" height="3"/><rect x="120" y="71" width="2" height="3"/><rect x="135" y="71" width="2" height="3"/>
          </g>
          <g class="bunny">
            <rect x="125" y="60" width="2" height="4" fill="#f3e8c6"/><rect x="129" y="60" width="2" height="4" fill="#f3e8c6"/>
            <rect x="124" y="64" width="8" height="3" fill="#f3e8c6"/><rect x="123" y="67" width="10" height="2" fill="#e57865"/>
          </g>
          <g class="hook-ripple">
            <rect x="151" y="80" width="3" height="1" fill="#f3e8c6"/>
            <rect x="150" y="82" width="5" height="1" fill="#f3e8c6" opacity=".6"/>
          </g>
        </svg>
      </div>

      <section id="notes" class="notes">
        <h2>最近的思考</h2>
        <div v-if="notes && notes.length" class="grid">
          <NuxtLink v-for="(n, i) in notes" :key="n.path" :to="n.path" class="card">
            <div class="card-top">
              <span class="num">No.{{ String(i + 1).padStart(2, '0') }}</span>
              <span v-for="t in (n.tags || []).slice(0, 1)" :key="t" class="tag">{{ t }}</span>
            </div>
            <h3>{{ n.title }}</h3>
            <p v-if="n.description">{{ n.description }}</p>
            <div class="card-bot">
              <time v-if="n.date">{{ n.date }}</time>
              <span class="read">{{ n.readMin ? `${n.readMin} min →` : 'read →' }}</span>
            </div>
          </NuxtLink>
        </div>
        <p v-else class="empty">森林裡還沒有任何筆記。</p>
      </section>

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
.frame { max-width: 1100px; margin: 0 auto; background: linear-gradient(180deg, #d8e4dc 0%, #c8d8cf 60%, #97b6ad 60%, #97b6ad 100%); border-radius: 8px; overflow: clip; box-shadow: 0 8px 0 #1f3329, 0 0 0 3px #1f3329; }

/* Sticky bunny companion — appears after scrolling past hero */
.sticky-bunny { position: fixed; bottom: 24px; left: 24px; width: 56px; height: 56px; z-index: 100; opacity: 0; transform: translateY(20px) scale(.8); transition: opacity .35s, transform .35s; pointer-events: none; image-rendering: pixelated; filter: drop-shadow(2px 2px 0 rgba(31, 51, 41, 0.4)); }
.sticky-bunny.visible { opacity: 1; transform: translateY(0) scale(1); animation: bunny-hop 2.6s steps(2) infinite 0.4s; }
.sticky-bunny svg { width: 100%; height: 100%; display: block; }
@keyframes bunny-hop { 0%, 100% { translate: 0 0; } 50% { translate: 0 -2px; } }

/* topbar — sticky, shrinks on scroll */
.topbar { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; gap: 1.5rem; flex-wrap: wrap; background: rgba(248, 243, 230, 0.4); backdrop-filter: blur(4px); transition: padding .25s, background .25s, backdrop-filter .25s, box-shadow .25s; }
.topbar.scrolled { padding: .65rem 2rem; background: rgba(248, 243, 230, 0.88); backdrop-filter: blur(14px); box-shadow: 0 2px 0 rgba(31, 51, 41, 0.08); }
.topbar.scrolled .logo { font-size: .95rem; }
.topbar.scrolled .name { font-size: .9rem; }
.topbar.scrolled .cta-mini { padding: 5px 12px; font-size: .76rem; box-shadow: 2px 2px 0 #1f3329; }
.brand { display: flex; align-items: center; gap: .5rem; font-weight: 600; }
.brand-btn { background: transparent; border: none; font: inherit; cursor: pointer; color: inherit; padding: 0; }
.logo { color: #1f3329; font-size: 1.1rem; }
.name { font-size: 1rem; font-family: 'Pixelify Sans', sans-serif; }
.topbar nav { display: flex; gap: 1.5rem; flex: 1; justify-content: center; }
.topbar nav a { color: #1f3329; text-decoration: none; font-size: .95rem; font-weight: 500; position: relative; }
.topbar nav a:hover::after { content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: #e57865; }
.cta-mini { font-family: 'JetBrains Mono', monospace; font-size: .82rem; background: #e57865; color: #fffbf2; border: 2px solid #1f3329; border-radius: 999px; padding: 7px 16px; cursor: pointer; box-shadow: 3px 3px 0 #1f3329; transition: transform .15s, box-shadow .15s; }
.cta-mini:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 #1f3329; }

.hero { padding: 2.5rem 2rem 1rem; text-align: center; }
.hero h1 { font-family: 'Pixelify Sans', sans-serif; font-size: clamp(2.25rem, 5vw, 3.5rem); line-height: 1.1; letter-spacing: -.02em; margin: 0 0 1rem; color: #1f3329; font-weight: 500; }
.lede { font-size: .95rem; line-height: 1.7; color: #2c4a3c; max-width: 480px; margin: 0 auto 2.5rem; font-family: 'JetBrains Mono', monospace; }

.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 720px; margin: 0 auto 2rem; }
.feat { padding: .5rem .75rem; }
.ico { display: inline-block; width: 40px; height: 40px; margin-bottom: .5rem; }
.ico svg { width: 100%; height: 100%; image-rendering: pixelated; }
.feat h3 { font-family: 'Pixelify Sans', sans-serif; font-size: .95rem; margin: .25rem 0 .4rem; font-weight: 600; }
.feat p { font-family: 'JetBrains Mono', monospace; font-size: .78rem; line-height: 1.55; color: #2c4a3c; margin: 0; }

.enter-wrap { display: flex; justify-content: center; margin: 1.5rem 0 .5rem; }
.enter-btn { display: inline-flex; align-items: center; gap: .5rem; background: #e57865; color: #fffbf2; border: 2px solid #1f3329; border-radius: 999px; padding: 9px 20px; font: inherit; font-family: 'Pixelify Sans', sans-serif; font-size: 1rem; cursor: pointer; box-shadow: 3px 3px 0 #1f3329; transition: transform .15s, box-shadow .15s; letter-spacing: .02em; }
.enter-btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #1f3329; }
.enter-btn:hover .enter-arrow { transform: translateX(3px); }
.enter-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #1f3329; }
.enter-btn:disabled { opacity: .7; cursor: not-allowed; }
.enter-arrow { transition: transform .2s; }

.scene { line-height: 0; }
.bg-svg { width: 100%; height: clamp(180px, 28vw, 280px); image-rendering: pixelated; display: block; }
.scene.entering .bg-svg { animation: forest-zoom 800ms steps(8) forwards; transform-origin: 47% 70%; }
@keyframes forest-zoom { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.4); opacity: .2; } }

.cloud-a { animation: cloud-drift 22s steps(20) infinite; }
.cloud-b { animation: cloud-drift 28s steps(20) infinite -8s; }
.cloud-c { animation: cloud-drift 18s steps(20) infinite -4s; }
@keyframes cloud-drift { 0% { transform: translateX(0); } 100% { transform: translateX(40px); } }
.canopy-left { animation: sway-left 3s steps(2) infinite; }
.canopy-right { animation: sway-right 3.4s steps(2) infinite -1.2s; }
@keyframes sway-left { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(1px); } }
@keyframes sway-right { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-1px); } }
.ripples-a { animation: ripple-a 2.4s steps(4) infinite; }
.ripples-b { animation: ripple-b 3.2s steps(4) infinite -1.1s; }
@keyframes ripple-a { 0% { transform: translateX(0); } 100% { transform: translateX(8px); } }
@keyframes ripple-b { 0% { transform: translateX(0); } 100% { transform: translateX(-6px); } }
.hook-ripple { animation: hook-pulse 1.6s steps(3) infinite; transform-origin: 152px 81px; }
@keyframes hook-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: .6; } 100% { transform: scale(1); opacity: 1; } }
.bunny { animation: bunny-breathe 2.8s steps(2) infinite; }
@keyframes bunny-breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1px); } }
@media (prefers-reduced-motion: reduce) { .cloud-a, .cloud-b, .cloud-c, .canopy-left, .canopy-right, .ripples-a, .ripples-b, .hook-ripple, .bunny { animation: none; } }

.notes { background: #fffbf2; padding: 3rem 2rem; border-top: 3px solid #1f3329; }
.notes h2 { font-family: 'Pixelify Sans', sans-serif; text-align: center; font-size: 1.5rem; margin: 0 0 2rem; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; max-width: 980px; margin: 0 auto; }
.card { display: block; background: #f5efe0; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #1f3329; padding: 1.25rem; text-align: left; font: inherit; color: inherit; text-decoration: none; cursor: pointer; transition: transform .15s, box-shadow .15s; }
.card:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #1f3329; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
.num { font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; font-weight: 600; }
.tag { background: #97b6ad; color: #1f3329; border: 1.5px solid #1f3329; padding: 1px 8px; font-size: .68rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
.card h3 { font-family: 'Pixelify Sans', sans-serif; font-size: 1rem; margin: 0 0 .5rem; font-weight: 600; line-height: 1.35; }
.card p { font-family: 'JetBrains Mono', monospace; font-size: .78rem; line-height: 1.55; color: #4a6f5d; margin: 0 0 1rem; }
.card-bot { display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; }
.read { font-weight: 600; color: #e57865; }
.empty { text-align: center; color: #6e8d7a; font-family: 'JetBrains Mono', monospace; }

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
  .features { grid-template-columns: 1fr; }
  .topbar nav { order: 3; flex-basis: 100%; justify-content: flex-start; }
}
</style>
