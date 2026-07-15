<script setup lang="ts">
import SchedulingBoard from '@/components/scheduling/SchedulingBoard.vue'
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <i class="pi pi-clock text-xl text-amber-600"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-surface-900">Penjadwalan</h1>
        <p class="text-surface-400 text-xs mt-0.5">Susun dan jalankan algoritma penjadwalan</p>
      </div>
    </div>

    <SchedulingBoard mode="edit" />
  </div>
</template>
