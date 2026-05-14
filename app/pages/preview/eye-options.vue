<script setup lang="ts">
type Rect = [number, number, number, number, string]

interface EyeVariant {
  id: string
  name: string
  vibe: string
  viewBox: string
  width: number
  height: number
  rects: Rect[]
}

const dark = '#1f3329'
const blush = '#fda4af'
const sparkle = '#fffbf2'
const coral = '#e57865'

const variants: EyeVariant[] = [
  {
    id: 'sparkle-round',
    name: 'A · 大瞳閃亮',
    vibe: '8x8 圓眼，big pupil + 雙 highlight。經典 anime chibi 風',
    viewBox: '0 0 8 8',
    width: 16,
    height: 16,
    rects: [
      // 圓形瞳孔（八角形逼近圓）
      [2, 0, 4, 1, dark],
      [1, 1, 6, 1, dark],
      [0, 2, 8, 4, dark],
      [1, 6, 6, 1, dark],
      [2, 7, 4, 1, dark],
      // 主 highlight 左上
      [2, 2, 2, 2, sparkle],
      // 次 highlight 右下小點
      [5, 4, 1, 1, sparkle],
    ],
  },
  {
    id: 'tiny-dot',
    name: 'B · 純黑小點',
    vibe: '4x4 圓點，最簡。完全沒眼白，無侵略感',
    viewBox: '0 0 4 4',
    width: 12,
    height: 12,
    rects: [
      [1, 0, 2, 1, dark],
      [0, 1, 4, 2, dark],
      [1, 3, 2, 1, dark],
      // 小高光
      [1, 1, 1, 1, sparkle],
    ],
  },
  {
    id: 'pair-dots',
    name: 'C · 雙瞳並排',
    vibe: '兩顆小圓點，像角色臉。看到的是「有人在那」而非「被盯著」',
    viewBox: '0 0 10 4',
    width: 20,
    height: 8,
    rects: [
      // 左眼
      [1, 0, 2, 1, dark],
      [0, 1, 3, 2, dark],
      [1, 3, 2, 1, dark],
      [1, 1, 1, 1, sparkle],
      // 右眼
      [7, 0, 2, 1, dark],
      [6, 1, 3, 2, dark],
      [7, 3, 2, 1, dark],
      [7, 1, 1, 1, sparkle],
    ],
  },
  {
    id: 'sleepy',
    name: 'D · 瞇瞇眼',
    vibe: '彎彎一條線，半夢半醒。完全沒在「看」你',
    viewBox: '0 0 8 3',
    width: 18,
    height: 8,
    rects: [
      // 中段
      [2, 1, 4, 1, dark],
      // 兩端微微下垂
      [1, 0, 1, 1, dark],
      [6, 0, 1, 1, dark],
    ],
  },
  {
    id: 'happy-curve',
    name: 'E · 笑笑眼',
    vibe: '^_^ 倒彎月。出現在 view count 旁邊很可愛',
    viewBox: '0 0 8 3',
    width: 18,
    height: 8,
    rects: [
      // 中段
      [2, 0, 4, 1, dark],
      // 兩端微微上揚
      [1, 1, 1, 1, dark],
      [6, 1, 1, 1, dark],
    ],
  },
  {
    id: 'blushy',
    name: 'F · 害羞點點',
    vibe: '小黑點 + 兩腮粉紅。最甜版',
    viewBox: '0 0 10 4',
    width: 20,
    height: 8,
    rects: [
      // 左眼
      [2, 1, 1, 1, dark],
      // 右眼
      [7, 1, 1, 1, dark],
      // 左腮紅
      [0, 2, 1, 1, blush],
      // 右腮紅
      [9, 2, 1, 1, blush],
    ],
  },
  {
    id: 'oval-sparkle',
    name: 'G · 橢圓閃亮',
    vibe: '6x4 寬橢圓 + highlight。介於 A 跟 B 之間',
    viewBox: '0 0 6 4',
    width: 18,
    height: 12,
    rects: [
      [1, 0, 4, 1, dark],
      [0, 1, 6, 2, dark],
      [1, 3, 4, 1, dark],
      // highlight
      [1, 1, 2, 1, sparkle],
      // 小亮點
      [4, 2, 1, 1, sparkle],
    ],
  },
  {
    id: 'coral-heart',
    name: 'H · 珊瑚愛心',
    vibe: '不是眼睛是珊瑚紅 ♡。看到喜歡的內容會用的符號',
    viewBox: '0 0 7 6',
    width: 18,
    height: 14,
    rects: [
      [1, 0, 2, 1, coral],
      [4, 0, 2, 1, coral],
      [0, 1, 7, 2, coral],
      [1, 3, 5, 1, coral],
      [2, 4, 3, 1, coral],
      [3, 5, 1, 1, coral],
    ],
  },
]

const sampleCount = 42
</script>

<template>
  <div class="page">
    <header class="head">
      <h1>Eye sprite v2 — 8 個重設計</h1>
      <p>按 chibi 像素藝術原則重做：大瞳孔、加 highlight、形狀圓滑。挑你喜歡的編號告訴我。</p>
      <p class="hint">每個卡片是「真實情境」（卡片右下放 view count 42）。下方有 4 倍放大圖。</p>
    </header>

    <div class="grid">
      <article v-for="v in variants" :key="v.id" class="demo-card">
        <div class="card-top">
          <span class="num">No.01</span>
          <span class="tag">demo</span>
        </div>
        <h3>從零初始化 Nuxt 4 + Content</h3>
        <p>Vue 工程師第一次用 Nuxt 4 + Content 建專案的完整紀錄。</p>
        <div class="card-bot">
          <time>2026-05-08</time>
          <span class="read-meta">
            <span class="views" aria-label="閱讀數">
              <svg class="eye-sprite" :viewBox="v.viewBox" :width="v.width" :height="v.height" shape-rendering="crispEdges">
                <rect v-for="(r, i) in v.rects" :key="i" :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]" :fill="r[4]" />
              </svg>
              {{ sampleCount }}
            </span>
            <span class="read">8 min →</span>
          </span>
        </div>
        <div class="label">
          <strong>{{ v.name }}</strong>
          <span class="vibe">{{ v.vibe }}</span>
        </div>
      </article>
    </div>

    <div class="zoom-row">
      <h2>放大對照（8 倍）</h2>
      <div class="zooms">
        <div v-for="v in variants" :key="v.id" class="zoom-cell">
          <div class="zoom-frame">
            <svg :viewBox="v.viewBox" shape-rendering="crispEdges" class="zoom-svg">
              <rect v-for="(r, i) in v.rects" :key="i" :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]" :fill="r[4]" />
            </svg>
          </div>
          <p>{{ v.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { background: #f5f7f4; min-height: 100vh; padding: 3rem 1.5rem; font-family: 'Pixelify Sans', 'Inter', sans-serif; color: #1f3329; }
.page > * { max-width: 1100px; margin-left: auto; margin-right: auto; }
.head { margin-bottom: 2rem; text-align: center; }
.head h1 { font-size: 2.25rem; margin: 0 0 .5rem; font-weight: 500; }
.head p { font-family: 'JetBrains Mono', monospace; font-size: .85rem; color: #4a6f5d; max-width: 600px; margin: .5rem auto; line-height: 1.55; }
.head .hint { font-size: .78rem; color: #6e8d7a; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 4rem; }
.demo-card { background: #f5efe0; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #1f3329; padding: 1.25rem; display: flex; flex-direction: column; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; }
.tag { background: #97b6ad; color: #1f3329; border: 1.5px solid #1f3329; padding: 1px 8px; font-size: .68rem; font-weight: 600; }
.demo-card h3 { font-family: 'Pixelify Sans', sans-serif; font-size: 1rem; margin: 0 0 .5rem; line-height: 1.35; }
.demo-card > p { font-family: 'JetBrains Mono', monospace; font-size: .78rem; line-height: 1.55; color: #4a6f5d; margin: 0 0 1rem; }
.card-bot { display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: .72rem; color: #6e8d7a; }
.read-meta { display: inline-flex; align-items: center; gap: .65rem; }
.views { display: inline-flex; align-items: center; gap: .35rem; color: #4a6f5d; }
.eye-sprite { image-rendering: pixelated; }
.read { font-weight: 600; color: #e57865; }
.label { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #97b6ad; font-family: 'JetBrains Mono', monospace; font-size: .75rem; }
.label strong { display: block; color: #1f3329; margin-bottom: .25rem; font-size: .85rem; }
.label .vibe { color: #6e8d7a; line-height: 1.5; }

.zoom-row h2 { font-size: 1.25rem; text-align: center; margin: 0 0 1.5rem; }
.zooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
.zoom-cell { text-align: center; }
.zoom-frame { background: #f5efe0; border: 2px solid #1f3329; padding: 1rem; display: flex; align-items: center; justify-content: center; height: 100px; margin-bottom: .5rem; }
.zoom-svg { width: 80%; max-height: 80px; image-rendering: pixelated; }
.zoom-cell p { font-family: 'JetBrains Mono', monospace; font-size: .75rem; color: #4a6f5d; margin: 0; }
</style>
