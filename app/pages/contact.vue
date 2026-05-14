<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  topic: '',
  message: '',
})

const status = ref<'idle' | 'submitting' | 'sent' | 'error'>('idle')

function scrollToTopOfContact() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function onSubmit() {
  if (status.value === 'submitting') return
  status.value = 'submitting'

  // Fallback for now: open user's mail client with prefilled content
  // TODO: replace with Formspree / Resend endpoint once chosen
  const subject = encodeURIComponent(`[Quiet Notes] ${form.topic || '聯絡訊息'}`)
  const body = encodeURIComponent(
    `寄件者：${form.name}\n回信信箱：${form.email}\n\n${form.message}`,
  )
  // Placeholder — user will provide real recipient email
  const recipient = 'YOUR_EMAIL_HERE@example.com'
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`

  setTimeout(() => {
    status.value = 'sent'
  }, 400)
}

useHead({
  title: 'Contact — Quiet Notes',
  meta: [
    { name: 'description', content: '寄個訊息給住在這座森林的人。' },
  ],
})
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
        <span class="reading-meta">/contact</span>
      </header>

      <section class="hero">
        <p class="kicker">— Contact</p>
        <h1>寄一封信<br />到森林裡。</h1>
        <p class="lede">
          有任何想討論的、想罵的、想分享的，寫下來。<br />
          雖然兔子不會回，但住在這座森林的人會。
        </p>
      </section>

      <section class="form-wrap">
        <form @submit.prevent="onSubmit" class="contact-form" v-if="status !== 'sent'">
          <div class="row">
            <label for="name">
              <span class="lab">你的名字</span>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="例：阿筆"
              />
            </label>
          </div>

          <div class="row">
            <label for="email">
              <span class="lab">回信信箱</span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>
          </div>

          <div class="row">
            <label for="topic">
              <span class="lab">主題</span>
              <input
                id="topic"
                v-model="form.topic"
                type="text"
                placeholder="一句話告訴我這封信在說什麼"
              />
            </label>
          </div>

          <div class="row">
            <label for="message">
              <span class="lab">訊息內容</span>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="8"
                placeholder="慢慢寫，沒人催。"
              ></textarea>
            </label>
          </div>

          <div class="actions">
            <button type="submit" class="send" :disabled="status === 'submitting'">
              <span class="arrow">→</span>
              <span>{{ status === 'submitting' ? '送信中…' : '寄出' }}</span>
            </button>
          </div>

          <p class="note">
            ※ 目前送出會開啟你的郵件 client 預填內容寄出，等正式 form service 接好就會直接送達。
          </p>
        </form>

        <div v-else class="sent-card">
          <div class="sent-sprite" aria-hidden="true">
            <svg viewBox="0 0 24 24" shape-rendering="crispEdges">
              <rect x="9" y="2" width="2" height="5" fill="#f3e8c6"/>
              <rect x="13" y="2" width="2" height="5" fill="#f3e8c6"/>
              <rect x="10" y="4" width="1" height="3" fill="#fda4af"/>
              <rect x="13" y="4" width="1" height="3" fill="#fda4af"/>
              <rect x="8" y="7" width="8" height="5" fill="#f3e8c6"/>
              <rect x="10" y="9" width="1" height="1" fill="#1f3329"/>
              <rect x="14" y="9" width="1" height="1" fill="#1f3329"/>
              <rect x="12" y="11" width="1" height="1" fill="#1f3329"/>
              <rect x="7" y="12" width="10" height="6" fill="#e57865"/>
              <rect x="8" y="18" width="3" height="2" fill="#f3e8c6"/>
              <rect x="14" y="18" width="3" height="2" fill="#f3e8c6"/>
            </svg>
          </div>
          <h2>送出去了！</h2>
          <p>兔子已經帶著你的信跑進森林了，住在這的人會看到。</p>
          <button class="back-btn" @click="status = 'idle'; scrollToTopOfContact()">
            ← 再寫一封
          </button>
        </div>
      </section>

      <footer class="ft">
        <div class="ft-left">
          <NuxtLink to="/" class="logo-link" aria-label="首頁">▲</NuxtLink>
          <span>Quiet Notes · 2026 · 用 Vue 與一些耐心，慢慢長出來。</span>
        </div>
        <div class="ft-socials">
          <a href="/feed.xml" aria-label="RSS feed" class="ic-link ic-rss"></a>
          <a href="https://github.com/KazenoYu" target="_blank" rel="noopener" aria-label="GitHub" class="ic-link ic-github"></a>
          <NuxtLink to="/contact" aria-label="Contact" class="ic-link ic-mail" />
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.px { background: #f5f7f4; min-height: 100vh; padding: 1.5rem; font-family: 'Pixelify Sans', 'JetBrains Mono', ui-monospace, monospace; color: #1f3329; }
.frame { max-width: 880px; margin: 0 auto; background: #fffbf2; border-radius: 8px; overflow: clip; box-shadow: 0 8px 0 #1f3329, 0 0 0 3px #1f3329; }

.topbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; gap: 1.5rem; flex-wrap: wrap; background: rgba(248, 243, 230, 0.6); }
.brand { display: flex; align-items: center; gap: .5rem; font-weight: 600; text-decoration: none; color: inherit; }
.logo { color: #1f3329; font-size: 1.1rem; }
.name { font-size: 1rem; font-family: 'Pixelify Sans', sans-serif; }
.topbar nav { display: flex; gap: 1.5rem; flex: 1; justify-content: center; }
.topbar nav a { color: #1f3329; text-decoration: none; font-size: .95rem; font-weight: 500; }
.topbar nav a:hover { color: #e57865; }
.reading-meta { font-family: 'JetBrains Mono', monospace; font-size: .82rem; color: #4a6f5d; }

.hero { padding: 3rem 2rem 1.5rem; text-align: center; }
.kicker { font-family: 'JetBrains Mono', monospace; font-size: .8rem; letter-spacing: .15em; color: #e57865; margin: 0 0 1rem; }
.hero h1 { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2rem, 5vw, 2.85rem); font-weight: 400; line-height: 1.15; letter-spacing: -.01em; margin: 0 0 1.25rem; }
.lede { font-family: 'JetBrains Mono', monospace; font-size: .9rem; line-height: 1.7; color: #2c4a3c; max-width: 480px; margin: 0 auto; }

.form-wrap { padding: 2rem 2rem 3rem; }
.contact-form { max-width: 560px; margin: 0 auto; display: grid; gap: 1.25rem; }
.row label { display: block; }
.lab { display: block; font-family: 'JetBrains Mono', monospace; font-size: .78rem; color: #4a6f5d; margin-bottom: .35rem; letter-spacing: .03em; }
input[type="text"], input[type="email"], textarea {
  width: 100%;
  background: #f5efe0;
  border: 2px solid #1f3329;
  padding: 10px 12px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: .95rem;
  color: #1f3329;
  box-shadow: 3px 3px 0 #1f3329;
  transition: transform .15s, box-shadow .15s;
  resize: vertical;
}
input:focus, textarea:focus {
  outline: none;
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #e57865;
}
textarea { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }

.actions { display: flex; justify-content: flex-end; }
.send {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #e57865; color: #fffbf2; border: 2px solid #1f3329; border-radius: 999px;
  padding: 9px 22px; font: inherit;
  font-family: 'Pixelify Sans', sans-serif; font-size: 1rem;
  cursor: pointer; box-shadow: 3px 3px 0 #1f3329;
  transition: transform .15s, box-shadow .15s;
}
.send:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #1f3329; }
.send:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #1f3329; }
.send:disabled { opacity: .6; cursor: not-allowed; }
.send .arrow { transition: transform .2s; }
.send:hover .arrow { transform: translateX(3px); }

.note {
  font-family: 'JetBrains Mono', monospace;
  font-size: .72rem;
  color: #6e8d7a;
  text-align: center;
  margin: 1rem 0 0;
}

/* Sent state */
.sent-card {
  max-width: 480px; margin: 2rem auto;
  background: #f5efe0; border: 2px solid #1f3329; box-shadow: 4px 4px 0 #1f3329;
  padding: 2.5rem 2rem; text-align: center;
}
.sent-sprite { display: inline-block; width: 72px; height: 72px; margin-bottom: 1rem; }
.sent-sprite svg { width: 100%; height: 100%; image-rendering: pixelated; }
.sent-card h2 { font-family: 'Pixelify Sans', sans-serif; font-size: 1.5rem; margin: 0 0 .5rem; }
.sent-card p { font-family: 'JetBrains Mono', monospace; font-size: .88rem; color: #2c4a3c; margin: 0 0 1.5rem; line-height: 1.6; }
.back-btn {
  background: transparent; border: 2px solid #1f3329;
  padding: 8px 16px; font: inherit;
  font-family: 'Pixelify Sans', sans-serif; font-size: .9rem;
  cursor: pointer; color: #1f3329;
  box-shadow: 3px 3px 0 #1f3329;
  transition: transform .15s, box-shadow .15s;
}
.back-btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #1f3329; }

/* footer */
.ft { background: #1f3329; color: #d8e4dc; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; font-family: 'JetBrains Mono', monospace; font-size: .78rem; }
.ft-left { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; color: #d8e4dc; }
.logo-link { color: inherit; text-decoration: none; font-size: 1rem; transition: color .15s, transform .15s; display: inline-block; }
.logo-link:hover { color: #e57865; transform: translateY(-2px); }
.ft-socials { display: flex; gap: .65rem; align-items: center; }
.ic-link { display: inline-block; width: 16px; height: 16px; background-color: #d8e4dc; -webkit-mask-size: 16px 16px; mask-size: 16px 16px; -webkit-mask-position: center; mask-position: center; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; transition: background-color .15s, transform .15s; }
.ic-link:hover { background-color: #e57865; transform: translateY(-2px); }
.ic-rss { -webkit-mask-image: url('https://unpkg.com/pixelarticons@latest/svg/rss.svg'); mask-image: url('https://unpkg.com/pixelarticons@latest/svg/rss.svg'); }
.ic-mail { -webkit-mask-image: url('https://unpkg.com/pixelarticons@latest/svg/mail.svg'); mask-image: url('https://unpkg.com/pixelarticons@latest/svg/mail.svg'); }
.ic-github { -webkit-mask-image: url('https://cdn.simpleicons.org/github'); mask-image: url('https://cdn.simpleicons.org/github'); }

@media (max-width: 700px) {
  .topbar nav { order: 3; flex-basis: 100%; justify-content: flex-start; }
}
</style>
