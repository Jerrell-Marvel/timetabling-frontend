<script setup lang="ts">
import AppMenu from './AppMenu.vue'
import { useLayout } from './composables/layout'

const { layoutState } = useLayout()
</script>

<template>
  <div
    class="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-md z-40 transition-transform duration-300 overflow-y-auto"
    :class="[
      layoutState.staticMenuInactive ? 'lg:-translate-x-full' : 'lg:translate-x-0',
      layoutState.mobileMenuActive ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="p-4">
      <AppMenu />
    </div>
  </div>
</template>
