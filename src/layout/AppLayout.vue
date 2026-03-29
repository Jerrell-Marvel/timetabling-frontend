<script setup lang="ts">
import { computed } from 'vue'
import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'
import { useLayout } from './composables/layout'

const { layoutState, hideMobileMenu } = useLayout()

const mainContentClass = computed(() => {
  return layoutState.staticMenuInactive ? 'lg:ml-0' : 'lg:ml-64'
})
</script>

<template>
  <div class="min-h-screen bg-surface-50">
    <AppTopbar />
    <AppSidebar />

    <div
      class="flex flex-col min-h-screen pt-16 transition-all duration-300"
      :class="mainContentClass"
    >
      <div class="p-6 flex-1">
        <router-view></router-view>
      </div>
    </div>

    <div
      v-if="layoutState.mobileMenuActive"
      class="fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity"
      @click="hideMobileMenu"
    ></div>
  </div>
</template>
