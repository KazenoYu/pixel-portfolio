<script setup lang="ts">
type Rect = [number, number, number, number, string]

interface Mascot {
  id: string
  name: string
  species: string
  vibe: string
  quote: string
  rects: Rect[]
}

const candidates: Mascot[] = [
  {
    id: 'bun', name: 'Bun', species: '兔子',
    vibe: '柔軟、慢吞吞、總是釣魚',
    quote: '嗨~ 今天也來這裡坐坐嗎？',
    rects: [
      // ears
      [9, 2, 2, 5, '#f3e8c6'], [13, 2, 2, 5, '#f3e8c6'],
      [10, 4, 1, 3, '#fda4af'], [13, 4, 1, 3, '#fda4af'],
      // head
      [8, 7, 8, 5, '#f3e8c6'],
      // eyes
      [10, 9, 1, 1, '#1f3329'], [14, 9, 1, 1, '#1f3329'],
      // cheeks
      [9, 10, 1, 1, '#fda4af'], [15, 10, 1, 1, '#fda4af'],
      // mouth
      [12, 11, 1, 1, '#1f3329'],
      // body
      [7, 12, 10, 6, '#e57865'],
      [6, 13, 1, 4, '#e57865'], [18, 13, 1, 4, '#e57865'],
      // shirt button
      [12, 14, 1, 1, '#fffbf2'],
      // feet
      [8, 18, 3, 2, '#f3e8c6'], [14, 18, 3, 2, '#f3e8c6'],
    ],
  },
  {
    id: 'hu', name: 'Hu', species: '狐狸',
    vibe: '好奇、靈巧、半夜出沒讀書',
    quote: '這篇看起來不錯，要一起讀嗎？',
    rects: [
      // ears
      [7, 3, 2, 3, '#d97757'], [16, 3, 2, 3, '#d97757'],
      [8, 5, 1, 1, '#1f3329'], [16, 5, 1, 1, '#1f3329'],
      // head
      [7, 6, 11, 5, '#e57865'],
      // white face
      [9, 7, 7, 4, '#f3e8c6'],
      // eyes
      [10, 8, 1, 1, '#1f3329'], [14, 8, 1, 1, '#1f3329'],
      // nose
      [12, 10, 1, 1, '#1f3329'],
      // body
      [8, 11, 9, 7, '#e57865'],
      [10, 12, 5, 5, '#f3e8c6'],
      // tail
      [17, 13, 3, 4, '#e57865'],
      [19, 14, 1, 2, '#f3e8c6'],
      // feet
      [8, 18, 3, 2, '#1f3329'], [14, 18, 3, 2, '#1f3329'],
    ],
  },
  {
    id: 'mochi', name: 'Mochi', species: '貓頭鷹',
    vibe: '博學、半夢半醒、住在最高的樹上',
    quote: '咕咕，這個概念我以前也想過...',
    rects: [
      // ear tufts
      [7, 3, 2, 2, '#4a6f5d'], [15, 3, 2, 2, '#4a6f5d'],
      // body
      [6, 5, 12, 13, '#6e9075'],
      [5, 7, 1, 8, '#6e9075'], [18, 7, 1, 8, '#6e9075'],
      // belly
      [9, 11, 6, 6, '#a4c2a5'],
      // eyes
      [7, 7, 4, 4, '#fffbf2'], [13, 7, 4, 4, '#fffbf2'],
      [8, 8, 2, 2, '#1f3329'], [14, 8, 2, 2, '#1f3329'],
      [8, 8, 1, 1, '#fffbf2'], [14, 8, 1, 1, '#fffbf2'],
      // beak
      [11, 11, 2, 2, '#e57865'],
      // feet
      [8, 18, 2, 2, '#e57865'], [14, 18, 2, 2, '#e57865'],
    ],
  },
  {
    id: 'kuro', name: 'Kuro', species: '貓',
    vibe: '冷靜、觀察、想說話又懶得',
    quote: '...（盯著你看）',
    rects: [
      // ears
      [6, 4, 2, 3, '#1f3329'], [16, 4, 2, 3, '#1f3329'],
      [7, 5, 1, 1, '#fda4af'], [16, 5, 1, 1, '#fda4af'],
      // head
      [6, 7, 12, 6, '#1f3329'],
      // eyes (green)
      [9, 9, 1, 2, '#a4c2a5'], [14, 9, 1, 2, '#a4c2a5'],
      // nose + mouth
      [12, 11, 1, 1, '#fda4af'],
      [11, 12, 1, 1, '#fda4af'], [13, 12, 1, 1, '#fda4af'],
      // body
      [7, 13, 10, 6, '#1f3329'],
      [16, 14, 3, 4, '#1f3329'], [18, 13, 1, 2, '#1f3329'],
      [8, 17, 2, 2, '#3a4f43'], [14, 17, 2, 2, '#3a4f43'],
    ],
  },
  {
    id: 'nori', name: 'Nori', species: '浣熊',
    vibe: '收藏家，喜歡撿筆記',
    quote: '欸，這個值得收進口袋裡。',
    rects: [
      // ears
      [7, 3, 2, 2, '#6b7280'], [15, 3, 2, 2, '#6b7280'],
      // head
      [6, 5, 12, 6, '#9ca3af'],
      // mask
      [7, 7, 10, 2, '#1f3329'],
      [9, 7, 1, 1, '#fffbf2'], [14, 7, 1, 1, '#fffbf2'],
      // nose
      [12, 10, 1, 1, '#1f3329'],
      // body
      [7, 11, 10, 7, '#9ca3af'],
      [9, 12, 6, 5, '#d1d5db'],
      // tail
      [16, 13, 4, 2, '#9ca3af'], [16, 15, 4, 2, '#1f3329'],
      [19, 15, 1, 1, '#9ca3af'],
      // feet
      [8, 18, 2, 2, '#1f3329'], [14, 18, 2, 2, '#1f3329'],
    ],
  },
  {
    id: 'pip', name: 'Pip', species: '小麻雀',
    vibe: '活潑、好動、嘰嘰喳喳',
    quote: '快看快看！這個有趣！',
    rects: [
      // body (round)
      [8, 8, 9, 9, '#9a6f4d'],
      [7, 10, 1, 5, '#9a6f4d'], [17, 10, 1, 5, '#9a6f4d'],
      // belly
      [10, 11, 5, 5, '#f3e8c6'],
      // head darker
      [9, 7, 7, 4, '#7a5c3e'],
      // eye
      [10, 9, 2, 2, '#fffbf2'], [11, 10, 1, 1, '#1f3329'],
      // beak
      [13, 10, 2, 1, '#e57865'], [13, 11, 1, 1, '#d97757'],
      // wing lines
      [13, 13, 3, 1, '#7a5c3e'], [13, 14, 4, 1, '#7a5c3e'],
      // feet
      [10, 17, 1, 2, '#e57865'], [13, 17, 1, 2, '#e57865'],
    ],
  },
  {
    id: 'forn', name: 'Forn', species: '小蘑菇精靈',
    vibe: '神秘、慢慢長大、不太說話',
    quote: '......',
    rects: [
      // cap red
      [7, 4, 10, 6, '#b91c1c'],
      [6, 6, 1, 3, '#b91c1c'], [17, 6, 1, 3, '#b91c1c'],
      [5, 8, 1, 1, '#b91c1c'], [18, 8, 1, 1, '#b91c1c'],
      // spots
      [9, 5, 2, 2, '#fffbf2'], [13, 6, 2, 2, '#fffbf2'],
      [11, 8, 1, 1, '#fffbf2'],
      // stem
      [9, 10, 6, 7, '#f3e8c6'],
      // face
      [10, 12, 1, 1, '#1f3329'], [13, 12, 1, 1, '#1f3329'],
      [11, 14, 2, 1, '#fda4af'],
      // base
      [8, 17, 8, 2, '#a4c2a5'],
      [9, 19, 6, 1, '#6e9075'],
    ],
  },
  {
    id: 'scholar', name: 'Yuki', species: '像素小書僮',
    vibe: '本來是學徒，現在替你管理森林',
    quote: '主人，今天有 3 篇新筆記。',
    rects: [
      // hat
      [8, 2, 8, 2, '#1f3329'],
      [9, 4, 6, 1, '#1f3329'],
      // hair
      [9, 5, 6, 1, '#7a5c3e'],
      // face
      [9, 6, 6, 4, '#f3e8c6'],
      // glasses
      [9, 7, 2, 2, '#1f3329'], [13, 7, 2, 2, '#1f3329'],
      [10, 8, 1, 1, '#fffbf2'], [13, 8, 1, 1, '#fffbf2'],
      // mouth
      [11, 9, 2, 1, '#1f3329'],
      // body (mint robe)
      [7, 10, 10, 8, '#97b6ad'],
      [9, 11, 6, 1, '#1f3329'],
      // book
      [4, 13, 4, 3, '#fef08a'],
      [4, 13, 1, 3, '#1f3329'], [7, 13, 1, 3, '#1f3329'],
      [4, 13, 4, 1, '#1f3329'], [4, 15, 4, 1, '#1f3329'],
      // feet
      [8, 18, 3, 2, '#1f3329'], [13, 18, 3, 2, '#1f3329'],
    ],
  },
]
</script>

<template>
  <div class="page">
    <header class="head">
      <h1>Mascot Candidates</h1>
      <p>8 個方向，每個都是 24×24 像素手繪 SVG。挑你喜歡的方向告訴我。</p>
      <p class="warn">⚠️ 這些是「方向探索」品質，<strong>不是</strong>最終資產。挑中方向後再請真正會畫像素的人精修，或我們找專業 sprite 套件。</p>
    </header>

    <div class="grid">
      <article v-for="c in candidates" :key="c.id" class="card">
        <div class="art-frame">
          <svg viewBox="0 0 24 24" shape-rendering="crispEdges">
            <rect v-for="(r, i) in c.rects" :key="i" :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]" :fill="r[4]" />
          </svg>
        </div>

        <h2>{{ c.name }}</h2>
        <p class="species">{{ c.species }}</p>
        <p class="vibe">{{ c.vibe }}</p>

        <div class="bubble">
          <svg class="bubble-sprite" viewBox="0 0 24 24" shape-rendering="crispEdges">
            <rect v-for="(r, i) in c.rects" :key="i" :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]" :fill="r[4]" />
          </svg>
          <div class="speech">{{ c.quote }}</div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page { background: #f5f7f4; min-height: 100vh; padding: 3rem 1.5rem; font-family: 'Pixelify Sans', 'Inter', sans-serif; color: #1f3329; }
.page > * { max-width: 1100px; margin-left: auto; margin-right: auto; }
.head { margin-bottom: 3rem; text-align: center; }
.head h1 { font-size: 2.5rem; margin: 0 0 .75rem; font-weight: 500; }
.head p { font-family: 'JetBrains Mono', monospace; font-size: .9rem; color: #4a6f5d; max-width: 540px; margin: .5rem auto; line-height: 1.55; }
.head .warn { color: #92400e; background: rgba(254, 240, 138, 0.4); border: 1.5px solid #c2410c; padding: .65rem 1rem; border-radius: 4px; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.card { background: #fffbf2; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #1f3329; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; gap: .35rem; }

.art-frame {
  width: 96px; height: 96px;
  background: linear-gradient(180deg, #d8e4dc 0%, #c8d8cf 70%, #97b6ad 70%, #97b6ad 100%);
  border: 2px solid #1f3329;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: .5rem;
}
.art-frame svg { width: 80%; height: 80%; image-rendering: pixelated; }

.card h2 { font-family: 'Pixelify Sans', sans-serif; font-size: 1.4rem; margin: 0; }
.species { font-family: 'JetBrains Mono', monospace; font-size: .75rem; color: #6e8d7a; margin: 0; }
.vibe { font-family: 'JetBrains Mono', monospace; font-size: .78rem; color: #2c4a3c; line-height: 1.55; margin: .25rem 0 .75rem; text-align: center; }

.bubble {
  display: flex; align-items: center; gap: .5rem;
  background: rgba(151, 182, 173, 0.18);
  border: 1.5px solid #97b6ad;
  border-radius: 4px;
  padding: .5rem .75rem;
  width: 100%;
  margin-top: auto;
}
.bubble-sprite { width: 24px; height: 24px; image-rendering: pixelated; flex-shrink: 0; }
.speech { font-family: 'JetBrains Mono', monospace; font-size: .76rem; color: #1f3329; line-height: 1.45; }
</style>
