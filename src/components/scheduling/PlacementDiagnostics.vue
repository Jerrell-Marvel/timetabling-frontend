<script setup lang="ts">
/**
 * Pointer-positioned validation-failure message card, reads
 * `checkValidation().messages`. Replaces `EditTableHoverComponent`.
 */
defineProps<{
  messages: string[]
  x: number
  y: number
}>()
</script>

<template>
  <div
    v-if="messages.length"
    class="fixed z-[1100] w-80 rounded-2xl border border-surface-100 bg-white shadow-lg p-4 pointer-events-none"
    :style="{ left: `${x + 20}px`, top: `${y}px` }"
  >
    <h5 class="text-sm font-bold text-surface-900">Validasi Gagal</h5>
    <p class="text-xs text-surface-400 mt-0.5">Penyebab - penyebab kegagalan</p>
    <hr class="my-2 border-surface-100" />
    <ul class="list-disc pl-4 space-y-1">
      <li v-for="(msg, idx) in messages" :key="idx" class="text-sm text-red-600">{{ msg }}</li>
    </ul>
  </div>
</template>
