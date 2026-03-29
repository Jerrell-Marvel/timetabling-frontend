<script setup lang="ts">
import Button from 'primevue/button'
import { useLayout } from './composables/layout'

const { toggleMenu } = useLayout()
</script>

<template>
  <div
    class="fixed top-0 left-0 w-full h-16 bg-white shadow-sm flex items-center justify-between px-6 z-50"
  >
    <div class="flex items-center gap-4">
      <button
        @click="toggleMenu"
        class="p-2 rounded-full hover:bg-surface-100 transition-colors cursor-pointer text-surface-700"
      >
        <i class="pi pi-bars text-xl"></i>
      </button>

      <span class="text-xl font-bold text-emerald-600">JadwalApp</span>
    </div>

    <div class="flex items-center gap-3">
      <Button
        label="Login"
        icon="pi pi-sign-in"
        severity="secondary"
        @click="$router.push('/login')"
      />
    </div>
  </div>
</template>
