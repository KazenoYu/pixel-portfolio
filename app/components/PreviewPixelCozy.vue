<script setup lang="ts">
import type { FakeNote } from '~/composables/fakeNotes'
defineProps<{ notes: FakeNote[] }>()

const selected = ref<number | null>(null)
const entering = ref(false)

function scrollToNotes() {
  document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function enterForest() {
  if (entering.value) return
  entering.value = true
  setTimeout(() => {
    scrollToNotes()
  }, 500)
  setTimeout(() => {
    entering.value = false
  }, 1200)
}
</script>

<template>
  <div class="px">
    <div class="frame">
      <!-- ============ LIST VIEW ============ -->
      <template v-if="selected === null">
        <header class="topbar">
          <div class="brand">
            <span class="logo">▲</span>
            <span class="name">Quiet Notes</span>
          </div>
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
            <!-- Clouds (drift slowly right) -->
            <g class="cloud cloud-a" fill="#f8f3e6">
              <rect x="40" y="10" width="22" height="3"/><rect x="38" y="13" width="26" height="3"/><rect x="44" y="16" width="20" height="3"/>
            </g>
            <g class="cloud cloud-b" fill="#f8f3e6">
              <rect x="200" y="6" width="30" height="3"/><rect x="196" y="9" width="38" height="3"/><rect x="200" y="12" width="32" height="3"/>
            </g>
            <g class="cloud cloud-c" fill="#f8f3e6">
              <rect x="120" y="20" width="20" height="2"/><rect x="118" y="22" width="24" height="2"/>
            </g>

            <!-- Distant hills -->
            <g fill="#a4c2a5">
              <rect x="0" y="55" width="40" height="20"/><rect x="35" y="50" width="50" height="25"/><rect x="80" y="58" width="40" height="17"/>
              <rect x="200" y="52" width="60" height="23"/><rect x="255" y="56" width="65" height="19"/>
            </g>

            <!-- Trees: split into trunk + canopy so we can sway canopies in wind -->
            <g fill="#6e9075">
              <!-- trunks (static) -->
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
            <!-- canopies sway slightly with wind -->
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

            <!-- Ground line -->
            <rect x="0" y="70" width="320" height="2" fill="#4a6f5d"/>

            <!-- Water -->
            <rect x="0" y="72" width="320" height="28" fill="#97b6ad"/>

            <!-- Water ripples: two layers drifting at different speeds -->
            <g class="ripples ripples-a" fill="#a8c2bb" opacity=".7">
              <rect x="20" y="78" width="8" height="1"/><rect x="50" y="82" width="6" height="1"/><rect x="90" y="80" width="10" height="1"/>
              <rect x="170" y="82" width="6" height="1"/><rect x="260" y="80" width="8" height="1"/>
            </g>
            <g class="ripples ripples-b" fill="#a8c2bb" opacity=".5">
              <rect x="130" y="86" width="8" height="1"/><rect x="210" y="88" width="10" height="1"/>
              <rect x="35" y="90" width="6" height="1"/><rect x="290" y="84" width="6" height="1"/>
            </g>

            <!-- Pier -->
            <g fill="#7a5c3e">
              <rect x="100" y="68" width="40" height="3"/><rect x="105" y="71" width="2" height="3"/><rect x="120" y="71" width="2" height="3"/><rect x="135" y="71" width="2" height="3"/>
            </g>

            <!-- Bunny (sits still) -->
            <g class="bunny">
              <rect x="125" y="60" width="2" height="4" fill="#f3e8c6"/><rect x="129" y="60" width="2" height="4" fill="#f3e8c6"/>
              <rect x="124" y="64" width="8" height="3" fill="#f3e8c6"/><rect x="123" y="67" width="10" height="2" fill="#e57865"/>
            </g>

            <!-- Fishing line ripple under hook (pulses) -->
            <g class="hook-ripple">
              <rect x="151" y="80" width="3" height="1" fill="#f3e8c6"/>
              <rect x="150" y="82" width="5" height="1" fill="#f3e8c6" opacity=".6"/>
            </g>
          </svg>
        </div>

        <section id="notes" class="notes">
          <h2>最近的思考</h2>
          <div class="grid">
            <button v-for="(n, i) in notes" :key="n.title" class="card" @click="selected = i">
              <div class="card-top">
                <span class="num">No.{{ String(i + 1).padStart(2, '0') }}</span>
                <span v-for="t in n.tags.slice(0, 1)" :key="t" class="tag">{{ t }}</span>
              </div>
              <h3>{{ n.title }}</h3>
              <p>{{ n.description }}</p>
              <div class="card-bot">
                <time>{{ n.date }}</time>
                <span class="read">{{ n.readMin }} min →</span>
              </div>
            </button>
          </div>
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
      </template>

      <!-- ============ ARTICLE VIEW ============ -->
      <template v-else-if="notes[selected]">
        <header class="topbar">
          <button class="brand brand-btn" @click="selected = null">
            <span class="logo">▲</span>
            <span class="name">Quiet Notes</span>
          </button>
          <nav>
            <a href="#">Notes</a>
            <a href="#">Tags</a>
            <a href="#">About</a>
          </nav>
          <span class="reading-meta">{{ notes[selected].readMin }} min · {{ notes[selected].date }}</span>
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
            <!-- small character sitting on the left -->
            <rect x="150" y="40" width="2" height="3" fill="#f3e8c6"/>
            <rect x="154" y="40" width="2" height="3" fill="#f3e8c6"/>
            <rect x="149" y="43" width="8" height="3" fill="#f3e8c6"/>
            <rect x="148" y="46" width="10" height="3" fill="#e57865"/>
          </svg>
        </div>

        <article class="article">
          <button class="back" @click="selected = null">
            <span class="back-arrow">←</span> Back to notes
          </button>

          <header class="art-head">
            <div class="meta-top">
              <span class="num-stamp">No.{{ String(selected + 1).padStart(2, '0') }}</span>
              <span class="dot"></span>
              <time>{{ notes[selected].date }}</time>
              <span class="dot"></span>
              <span>{{ notes[selected].readMin }} min read</span>
            </div>
            <h1>{{ notes[selected].title }}</h1>
            <p class="dek">{{ notes[selected].description }}</p>
            <div class="tags">
              <span v-for="t in notes[selected].tags" :key="t">{{ t }}</span>
            </div>
          </header>

          <div class="body-text">
            <p class="lead">這篇筆記從 0 開始紀錄第一次用 Nuxt 建專案的完整過程。我是 Vue 工程師，習慣的是 Vite + Vue 3 + Vue Router 自己拼 — Nuxt 對我而言是「設定即慣例」的世界，第一次踏進去有不少需要重新校準的直覺。</p>

            <div class="px-divider">
              <svg viewBox="0 0 80 8" shape-rendering="crispEdges">
                <g fill="#6e9075">
                  <rect x="34" y="2" width="2" height="2"/><rect x="32" y="4" width="6" height="2"/><rect x="34" y="6" width="2" height="2"/>
                  <rect x="42" y="2" width="2" height="2"/><rect x="40" y="4" width="6" height="2"/><rect x="42" y="6" width="2" height="2"/>
                </g>
                <rect x="0" y="4" width="28" height="1" fill="#1f3329"/>
                <rect x="52" y="4" width="28" height="1" fill="#1f3329"/>
              </svg>
            </div>

            <h2>環境前提</h2>
            <p>本次紀錄基於 <code>Node v25</code> + <code>npm 11</code>，作業系統 Windows 11，shell 使用 Git Bash。Nuxt 4 至少需要 Node 18+，大版本以上沒踩到不相容問題。</p>

            <blockquote>
              <p>「設定即慣例」的舒適感很強：不用配 router、不用配 SSR、不用配 build，東西就是自己跑起來。</p>
            </blockquote>

            <h2>第一個踩坑：better-sqlite3</h2>
            <p>第一次跑 <code>npm run dev</code> 直接噴錯。Nuxt Content v3 改用 SQLite 當索引，預設模板沒預裝 driver — 互動 prompt 在 AI 背景模式會直接 crash。</p>

            <pre data-lang="Bash"><code>npm install better-sqlite3</code></pre>

            <h2>第二個踩坑：Schema 沒宣告就查不到</h2>
            <p>SQLite 是強型別，frontmatter 必須在 <code>content.config.ts</code> 透過 zod 宣告才會建欄位。沒宣告的欄位內容仍存在但無法 query。</p>

            <h2>結語</h2>
            <p>真正值錢的不是「裝了什麼套件」，而是「踩坑當下的協作脈絡」。每次 AI 跑出非預期錯誤的時刻，都是重新校準工作流的機會。</p>

            <div class="end-mark">
              <svg viewBox="0 0 32 16" shape-rendering="crispEdges">
                <rect x="13" y="4" width="2" height="3" fill="#f3e8c6"/>
                <rect x="17" y="4" width="2" height="3" fill="#f3e8c6"/>
                <rect x="12" y="7" width="8" height="3" fill="#f3e8c6"/>
                <rect x="11" y="10" width="10" height="3" fill="#e57865"/>
              </svg>
              <span>— Fin —</span>
            </div>
          </div>

          <nav class="prev-next">
            <button
              class="pn-btn"
              :disabled="selected === 0"
              @click="selected !== null && selected > 0 && (selected = selected - 1)"
            >
              <span class="dir">← prev</span>
              <span v-if="selected > 0" class="ttl">{{ notes[selected - 1]?.title }}</span>
            </button>
            <button class="pn-btn home" @click="selected = null">↑ all notes</button>
            <button
              class="pn-btn"
              :disabled="selected === notes.length - 1"
              @click="selected !== null && selected < notes.length - 1 && (selected = selected + 1)"
            >
              <span class="dir">next →</span>
              <span v-if="selected < notes.length - 1" class="ttl">{{ notes[selected + 1]?.title }}</span>
            </button>
          </nav>
        </article>

        <footer>
          <span>▲ Quiet Notes · 2026</span>
          <span>讀完了，要不要走出去看看？</span>
        </footer>
      </template>
    </div>
  </div>
</template>

<style scoped>
.px {
  background: #f5f7f4;
  min-height: 100vh;
  padding: 1.5rem;
  font-family: 'Pixelify Sans', 'VT323', 'JetBrains Mono', ui-monospace, monospace;
  color: #1f3329;
}
.frame {
  max-width: 1100px;
  margin: 0 auto;
  background: linear-gradient(180deg, #d8e4dc 0%, #c8d8cf 60%, #97b6ad 60%, #97b6ad 100%);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 0 #1f3329, 0 0 0 3px #1f3329;
}

/* ========= shared topbar ========= */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
  background: rgba(248, 243, 230, 0.4);
}
.brand { display: flex; align-items: center; gap: .5rem; font-weight: 600; }
.brand-btn { background: transparent; border: none; font: inherit; cursor: pointer; color: inherit; padding: 0; }
.logo { color: #1f3329; font-size: 1.1rem; }
.name { font-size: 1rem; font-family: 'Pixelify Sans', sans-serif; }
.topbar nav { display: flex; gap: 1.5rem; flex: 1; justify-content: center; }
.topbar nav a { color: #1f3329; text-decoration: none; font-size: .95rem; font-weight: 500; position: relative; }
.topbar nav a:hover::after { content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: #e57865; }
.cta-mini, .reading-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: .82rem;
}
.cta-mini {
  background: #e57865;
  color: #fffbf2;
  border: 2px solid #1f3329;
  border-radius: 999px;
  padding: 7px 16px;
  cursor: pointer;
  box-shadow: 3px 3px 0 #1f3329;
  transition: transform .15s, box-shadow .15s;
}
.cta-mini:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 #1f3329; }
.reading-meta { color: #4a6f5d; font-weight: 500; }

/* ========= LIST: hero ========= */
.hero { padding: 2.5rem 2rem 1rem; text-align: center; }
.hero h1 {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -.02em;
  margin: 0 0 1rem;
  color: #1f3329;
  font-weight: 500;
}
.lede { font-size: .95rem; line-height: 1.7; color: #2c4a3c; max-width: 480px; margin: 0 auto 2.5rem; font-family: 'JetBrains Mono', monospace; }

.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 720px; margin: 0 auto 2rem; }
.feat { padding: .5rem .75rem; }
.ico { display: inline-block; width: 40px; height: 40px; margin-bottom: .5rem; }
.ico svg { width: 100%; height: 100%; image-rendering: pixelated; }
.feat h3 { font-family: 'Pixelify Sans', sans-serif; font-size: .95rem; margin: .25rem 0 .4rem; font-weight: 600; }
.feat p { font-family: 'JetBrains Mono', monospace; font-size: .78rem; line-height: 1.55; color: #2c4a3c; margin: 0; }

/* entry button — same family as Subscribe pill but slightly larger */
.enter-wrap { display: flex; justify-content: center; margin: 1.5rem 0 .5rem; }
.enter-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  background: #e57865;
  color: #fffbf2;
  border: 2px solid #1f3329;
  border-radius: 999px;
  padding: 9px 20px;
  font: inherit;
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 3px 3px 0 #1f3329;
  transition: transform .15s, box-shadow .15s;
  letter-spacing: .02em;
}
.enter-btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #1f3329; }
.enter-btn:hover .enter-arrow { transform: translateX(3px); }
.enter-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #1f3329; }
.enter-btn:disabled { opacity: .7; cursor: not-allowed; }
.enter-arrow { transition: transform .2s; }

/* zoom-in transition when entering forest */
.scene.entering .bg-svg {
  animation: forest-zoom 800ms steps(8) forwards;
  transform-origin: 47% 70%;
}
@keyframes forest-zoom {
  0%   { transform: scale(1);   opacity: 1; }
  100% { transform: scale(2.4); opacity: .2; }
}

/* SVG scenes */
.scene, .banner { line-height: 0; }
.bg-svg, .banner-svg { width: 100%; image-rendering: pixelated; display: block; }
.bg-svg { height: clamp(180px, 28vw, 280px); }
.banner-svg { height: clamp(100px, 16vw, 160px); }

/* ============ Pixel animations: use steps() to keep 8-bit feel ============ */

/* Clouds drift slowly rightward, in chunky 2px steps */
.cloud-a { animation: cloud-drift 22s steps(20) infinite; }
.cloud-b { animation: cloud-drift 28s steps(20) infinite -8s; }
.cloud-c { animation: cloud-drift 18s steps(20) infinite -4s; }
@keyframes cloud-drift {
  0%   { transform: translateX(0); }
  100% { transform: translateX(40px); }
}

/* Tree canopies sway with wind — tiny 1px nudge */
.canopy-left  { animation: sway-left  3s steps(2) infinite; transform-origin: 30px 60px; }
.canopy-right { animation: sway-right 3.4s steps(2) infinite -1.2s; transform-origin: 280px 60px; }
@keyframes sway-left {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(1px); }
}
@keyframes sway-right {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-1px); }
}

/* Water ripples drift sideways in different directions/speeds */
.ripples-a { animation: ripple-a 2.4s steps(4) infinite; }
.ripples-b { animation: ripple-b 3.2s steps(4) infinite -1.1s; }
@keyframes ripple-a {
  0%   { transform: translateX(0); }
  100% { transform: translateX(8px); }
}
@keyframes ripple-b {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-6px); }
}

/* Fishing hook ripple pulses (frame swap by opacity / scale) */
.hook-ripple { animation: hook-pulse 1.6s steps(3) infinite; transform-origin: 152px 81px; }
@keyframes hook-pulse {
  0%   { transform: scale(1);   opacity: 1; }
  50%  { transform: scale(1.4); opacity: .6; }
  100% { transform: scale(1);   opacity: 1; }
}

/* Bunny tiny "breathing" — y nudge 1px every couple seconds */
.bunny { animation: bunny-breathe 2.8s steps(2) infinite; }
@keyframes bunny-breathe {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
}

/* Respect users who prefer no motion */
@media (prefers-reduced-motion: reduce) {
  .cloud-a, .cloud-b, .cloud-c,
  .canopy-left, .canopy-right,
  .ripples-a, .ripples-b,
  .hook-ripple, .bunny {
    animation: none;
  }
}

/* ========= LIST: notes grid ========= */
.notes { background: #fffbf2; padding: 3rem 2rem; border-top: 3px solid #1f3329; }
.notes h2 { font-family: 'Pixelify Sans', sans-serif; text-align: center; font-size: 1.5rem; margin: 0 0 2rem; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; max-width: 980px; margin: 0 auto; }
.card {
  background: #f5efe0;
  border: 2px solid #1f3329;
  box-shadow: 4px 4px 0 #1f3329;
  padding: 1.25rem;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
}
.card:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #1f3329; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
.num { font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; font-weight: 600; }
.tag { background: #97b6ad; color: #1f3329; border: 1.5px solid #1f3329; padding: 1px 8px; font-size: .68rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
.card h3 { font-family: 'Pixelify Sans', sans-serif; font-size: 1rem; margin: 0 0 .5rem; font-weight: 600; line-height: 1.35; }
.card p { font-family: 'JetBrains Mono', monospace; font-size: .78rem; line-height: 1.55; color: #4a6f5d; margin: 0 0 1rem; }
.card-bot { display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; }
.read { font-weight: 600; color: #e57865; }

/* ============ Footer ============ */
.ft {
  background: #1f3329;
  color: #d8e4dc;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: .78rem;
}
.ft-left { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; color: #d8e4dc; }
.logo-btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font: inherit;
  line-height: 1;
  transition: color .15s, transform .15s;
}
.logo-btn:hover { color: #e57865; transform: translateY(-2px); }

.ft-socials { display: flex; gap: .65rem; align-items: center; }
.ic-link {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: #d8e4dc;
  -webkit-mask-size: 16px 16px;
          mask-size: 16px 16px;
  -webkit-mask-position: center;
          mask-position: center;
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  transition: background-color .15s, transform .15s;
}
.ic-link:hover { background-color: #e57865; transform: translateY(-2px); }
/* RSS & Mail: pixelarticons CDN (brand-free) */
.ic-rss     { -webkit-mask-image: url('https://unpkg.com/pixelarticons@latest/svg/rss.svg');     mask-image: url('https://unpkg.com/pixelarticons@latest/svg/rss.svg'); }
.ic-mail    { -webkit-mask-image: url('https://unpkg.com/pixelarticons@latest/svg/mail.svg');    mask-image: url('https://unpkg.com/pixelarticons@latest/svg/mail.svg'); }
/* GitHub & X: Simple Icons CDN (real brand logos, controllable via mask) */
.ic-github  { -webkit-mask-image: url('https://cdn.simpleicons.org/github'); mask-image: url('https://cdn.simpleicons.org/github'); }
.ic-twitter { -webkit-mask-image: url('https://cdn.simpleicons.org/x');      mask-image: url('https://cdn.simpleicons.org/x'); }

/* fallback for article-view footer (still using old simple footer) */
.article ~ footer {
  background: #1f3329;
  color: #d8e4dc;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: .78rem;
  flex-wrap: wrap;
  gap: .5rem;
}

/* ============ ARTICLE VIEW ============ */
.article {
  background: #fffbf2;
  padding: 2rem 2rem 4rem;
  max-width: 720px;
  margin: 0 auto;
  /* Body text uses readable typography */
  font-family: 'DM Serif Display', Georgia, 'Noto Serif TC', serif;
}
.back {
  background: rgba(151, 182, 173, 0.25);
  border: 2px solid #1f3329;
  border-radius: 999px;
  padding: 6px 14px;
  font: inherit;
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .85rem;
  color: #1f3329;
  cursor: pointer;
  margin-bottom: 2rem;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  transition: transform .15s, background .15s;
  box-shadow: 3px 3px 0 #1f3329;
}
.back:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #1f3329; background: rgba(151, 182, 173, 0.45); }

.art-head {
  padding-bottom: 1.75rem;
  border-bottom: 2px dashed #97b6ad;
  margin-bottom: 2.5rem;
}
.meta-top {
  display: flex;
  align-items: center;
  gap: .65rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: .78rem;
  color: #4a6f5d;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.num-stamp {
  background: #1f3329;
  color: #f3e8c6;
  padding: 2px 8px;
  font-weight: 600;
}
.meta-top .dot { width: 3px; height: 3px; background: #97b6ad; border-radius: 50%; }
.art-head h1 {
  font-family: 'DM Serif Display', Georgia, 'Noto Serif TC', serif;
  font-size: clamp(2rem, 5vw, 2.85rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -.01em;
  color: #1f3329;
  margin: 0 0 1rem;
}
.art-head .dek {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.1rem;
  line-height: 1.55;
  color: #2c4a3c;
  margin: 0 0 1.25rem;
}
.art-head .tags { display: flex; flex-wrap: wrap; gap: .4rem; }
.art-head .tags span {
  font-family: 'JetBrains Mono', monospace;
  background: #97b6ad;
  color: #1f3329;
  border: 1.5px solid #1f3329;
  padding: 2px 9px;
  font-size: .72rem;
  font-weight: 600;
}

/* === Prose body — readable, with pixel ornaments === */
.body-text {
  font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif;
  font-size: 1.05rem;
  line-height: 1.85;
  color: #1f3329;
}
.body-text .lead { font-size: 1.15rem; color: #1f3329; margin: 0 0 1.75rem; }
.body-text .lead::first-letter {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 4rem;
  font-weight: 400;
  float: left;
  line-height: .85;
  padding: .35rem .5rem 0 0;
  color: #e57865;
}
.body-text p { margin: 0 0 1.5rem; }

.body-text h2 {
  font-family: 'DM Serif Display', Georgia, 'Noto Serif TC', serif;
  font-size: 1.65rem;
  font-weight: 400;
  letter-spacing: -.01em;
  color: #1f3329;
  margin: 2.5rem 0 1rem;
  display: flex;
  align-items: center;
  gap: .75rem;
}
.body-text h2::before {
  content: '';
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  background:
    linear-gradient(#e57865, #e57865) 0 0 / 4px 4px no-repeat,
    linear-gradient(#e57865, #e57865) 8px 0 / 4px 4px no-repeat,
    linear-gradient(#e57865, #e57865) 0 8px / 4px 4px no-repeat,
    linear-gradient(#e57865, #e57865) 8px 8px / 4px 4px no-repeat,
    linear-gradient(#1f3329, #1f3329) 4px 4px / 4px 4px no-repeat;
}

.body-text code {
  font-family: 'JetBrains Mono', monospace;
  font-size: .9em;
  background: rgba(151, 182, 173, 0.3);
  color: #1f3329;
  padding: 1px 8px;
  border: 1.5px solid #97b6ad;
  font-weight: 500;
}
.body-text pre {
  position: relative;
  background: #1f3329;
  color: #f3e8c6;
  padding: 2.25rem 1.5rem 1.25rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: .9rem;
  margin: 1.75rem 0;
  overflow-x: auto;
  border: 2px solid #1f3329;
  box-shadow: 4px 4px 0 #97b6ad;
}
.body-text pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 0;
  left: 0;
  background: #e57865;
  color: #fffbf2;
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .78rem;
  letter-spacing: .05em;
  padding: 3px 12px 4px;
  font-weight: 500;
}
.body-text pre code { background: transparent; border: none; padding: 0; color: inherit; font-weight: 400; }

.body-text blockquote {
  position: relative;
  margin: 2rem 0;
  padding: 1.5rem 1.5rem 1.5rem 1.75rem;
  background: #f3e8c6;
  border: 2px solid #1f3329;
  box-shadow: 4px 4px 0 #97b6ad;
  font-family: 'DM Serif Display', Georgia, serif;
  font-style: italic;
  font-size: 1.2rem;
  line-height: 1.55;
  color: #1f3329;
}
.body-text blockquote p { margin: 0; }
.body-text blockquote p::first-letter { font-size: inherit; font-weight: inherit; float: none; padding: 0; color: inherit; }
.px-divider {
  margin: 2.5rem auto;
  display: flex;
  justify-content: center;
}
.px-divider svg {
  width: 100px;
  height: 12px;
  image-rendering: pixelated;
}

.end-mark {
  margin: 3rem 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
}
.end-mark svg { width: 32px; height: 16px; image-rendering: pixelated; }
.end-mark span {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .9rem;
  color: #4a6f5d;
  letter-spacing: .1em;
}

/* ===== prev/next ===== */
.prev-next {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: .75rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px dashed #97b6ad;
}
.pn-btn {
  background: #f5efe0;
  border: 2px solid #1f3329;
  box-shadow: 4px 4px 0 #1f3329;
  padding: .75rem 1rem;
  font: inherit;
  font-family: 'Inter', sans-serif;
  text-align: left;
  cursor: pointer;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  transition: transform .15s, box-shadow .15s;
}
.pn-btn:nth-child(3) { text-align: right; align-items: flex-end; }
.pn-btn:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #1f3329; }
.pn-btn:disabled { opacity: .35; cursor: not-allowed; box-shadow: 2px 2px 0 #1f3329; }
.pn-btn .dir { font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; letter-spacing: .05em; }
.pn-btn .ttl { font-size: .9rem; color: #1f3329; font-weight: 500; }
.pn-btn.home {
  align-self: center;
  background: #1f3329;
  color: #f3e8c6;
  text-align: center;
  display: block;
  font-family: 'Pixelify Sans', sans-serif;
  padding: .85rem 1.25rem;
  font-size: .85rem;
}

@media (max-width: 700px) {
  .features { grid-template-columns: 1fr; }
  .topbar nav { order: 3; flex-basis: 100%; justify-content: flex-start; }
  .prev-next { grid-template-columns: 1fr; }
}
</style>
