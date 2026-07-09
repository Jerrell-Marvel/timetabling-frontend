<script setup lang="ts">
// Minimal wrapper layout for unauthenticated pages (login, etc.)
// No sidebar, no topbar — just the page content.
</script>

<template>
  <div class="auth-layout min-h-screen bg-surface-50">
    <RouterView />
  </div>
</template>
