<script setup lang="ts">
import { fakeNotes } from '~/composables/fakeNotes'
import PreviewPixelCozy from '~/components/PreviewPixelCozy.vue'

useHead({
  title: 'Notes 設計預覽',
})
</script>

<template>
  <main>
    <PreviewPixelCozy :notes="fakeNotes" />
  </main>
</template>
