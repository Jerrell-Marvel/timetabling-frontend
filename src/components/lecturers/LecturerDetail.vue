<script setup lang="ts">
import type { Lecturer, LecturerTime } from '@/types'

defineProps<{ lecturer: Lecturer }>()

/** `day` is a 1-based index (1 = Senin … 6 = Sabtu); index 0 is unused padding. */
const DAY_LABELS = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function formatSlot(t: LecturerTime): string {
  return `${DAY_LABELS[t.day] ?? '-'}, ${t.startTime} - ${t.endTime}`
}
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
      <ul v-if="lecturer.notAvailable?.length" class="flex flex-col gap-1">
        <li
          v-for="(t, i) in lecturer.notAvailable"
          :key="t.id ?? i"
          class="text-sm text-surface-700"
        >
          {{ formatSlot(t) }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-400">Tidak ada data.</p>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Waktu Preferensi</h3>
      <ul v-if="lecturer.priority?.length" class="flex flex-col gap-1">
        <li v-for="(t, i) in lecturer.priority" :key="t.id ?? i" class="text-sm text-surface-700">
          {{ formatSlot(t) }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-400">Tidak ada data.</p>
    </div>
  </div>
</template>
