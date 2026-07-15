<script setup lang="ts">
import { RouterView } from 'vue-router'
// Toast and ConfirmDialog are globally auto-imported via the PrimeVue resolver.
</script>

<template>
  <RouterView />
  <Toast />
  <ConfirmDialog />
</template>

<style scoped></style>
