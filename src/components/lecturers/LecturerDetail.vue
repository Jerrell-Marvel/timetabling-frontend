<script setup lang="ts">
import type { Lecturer } from '@/types'

defineProps<{ lecturer: Lecturer }>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <p class="text-xs text-surface-400">NIK</p>
        <p class="font-medium text-surface-900">{{ lecturer.nik }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Nama</p>
        <p class="font-medium text-surface-900">{{ lecturer.name }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Alias</p>
        <p class="font-medium text-surface-900">{{ lecturer.alias || '-' }}</p>
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Waktu Tidak Tersedia</h3>
      <ul
        v-if="lecturer.times.some((t) => t.type === 'Unavailable')"
        class="flex flex-col gap-1"
      >
        <li
          v-for="(t, i) in lecturer.times.filter((t) => t.type === 'Unavailable')"
          :key="i"
          class="text-sm text-surface-700"
        >
          {{ t.day }}, {{ t.start }} - {{ t.end }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-400">Tidak ada data.</p>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Waktu Preferensi</h3>
      <ul v-if="lecturer.times.some((t) => t.type === 'Priority')" class="flex flex-col gap-1">
        <li
          v-for="(t, i) in lecturer.times.filter((t) => t.type === 'Priority')"
          :key="i"
          class="text-sm text-surface-700"
        >
          {{ t.day }}, {{ t.start }} - {{ t.end }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-400">Tidak ada data.</p>
    </div>
  </div>
</template>
