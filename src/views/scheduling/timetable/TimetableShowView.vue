<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SchedulingBoard from '@/components/scheduling/SchedulingBoard.vue'

const route = useRoute()
const router = useRouter()

const semesterId = computed(() => Number(route.params.id))
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        @click="router.push({ name: 'timetable.index' })"
      />
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <i class="pi pi-calendar text-xl text-amber-600"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-surface-900">Lihat Jadwal</h1>
          <p class="text-surface-400 text-xs mt-0.5">ID: {{ route.params.id }}</p>
        </div>
      </div>
    </div>

    <SchedulingBoard mode="result" :semester-id="semesterId" />
  </div>
</template>
