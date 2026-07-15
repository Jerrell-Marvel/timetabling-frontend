<script setup lang="ts">
/** Completeness/save/generation status. Replaces `FlashMessageComponent`. */
defineProps<{
  message: string
  status: boolean
}>()
</script>

<template>
  <Message v-if="message" :severity="status ? 'success' : 'error'" :closable="false">
    <strong>Aktivitas:</strong> {{ message }}
  </Message>
</template>
