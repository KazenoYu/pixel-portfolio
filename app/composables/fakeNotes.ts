export interface FakeNote {
  title: string
  description: string
  date: string
  tags: string[]
  readMin: number
}

export const fakeNotes: FakeNote[] = [
  {
    title: '從零初始化一個 Nuxt 3 + Content 專案的過程',
    description: 'Vue 工程師第一次用 Nuxt 4 + Content 建專案的完整紀錄，含 better-sqlite3 與 TTY 踩坑解析。',
    date: '2026-05-08',
    tags: ['nuxt', 'vue', 'setup'],
    readMin: 8,
  },
  {
    title: '從 Vue 到 Nuxt：心智模型的轉換筆記',
    description: '把 Vite + Vue 的開發直覺對應到 Nuxt 的檔案路由、SSR、自動 import 等概念。',
    date: '2026-05-06',
    tags: ['nuxt', 'vue', 'mental-model'],
    readMin: 6,
  },
  {
    title: 'POS 系統的促銷規則設計：從業務語言到資料模型',
    description: '組合促銷、會員折扣、限時活動之間的優先順序與衝突處理。',
    date: '2026-04-29',
    tags: ['pos', 'domain-design', 'business'],
    readMin: 12,
  },
  {
    title: 'AI 輔助開發的五個工作流：我怎麼跟 Claude 共事',
    description: '從設計討論、寫測試、改 bug、整理筆記到 review，每個情境的角色分工。',
    date: '2026-04-22',
    tags: ['ai', 'workflow', 'claude'],
    readMin: 10,
  },
  {
    title: 'TypeScript 型別體操：Conditional Types 入門',
    description: '從 extends 三元式講到 infer，配合 utility types 看實戰用法。',
    date: '2026-04-14',
    tags: ['typescript', 'types'],
    readMin: 9,
  },
]
