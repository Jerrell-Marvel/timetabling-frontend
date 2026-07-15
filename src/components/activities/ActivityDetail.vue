<script setup lang="ts">
import type { Activity } from '@/types'

defineProps<{
  activity: Activity
  courseName?: string
  semesterName?: string
  roomNames?: string[]
  roomTypeNames?: string[]
  lecturerNames?: string[]
}>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <p class="text-xs text-surface-400">Semester</p>
        <p class="font-medium text-surface-900">{{ semesterName ?? activity.semester_id }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Matakuliah</p>
        <p class="font-medium text-surface-900">{{ courseName ?? activity.course_id }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Kuota</p>
        <p class="font-medium text-surface-900">{{ activity.quota }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Durasi</p>
        <p class="font-medium text-surface-900">{{ activity.duration }} jam</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Paralel</p>
        <p class="font-medium text-surface-900">{{ activity.parallel }}</p>
      </div>
    </div>

    <div>
      <p class="text-xs text-surface-400 mb-1">Ruangan</p>
      <p class="text-sm text-surface-700">{{ roomNames?.join(', ') || '-' }}</p>
    </div>
    <div>
      <p class="text-xs text-surface-400 mb-1">Tipe Ruangan</p>
      <p class="text-sm text-surface-700">{{ roomTypeNames?.join(', ') || '-' }}</p>
    </div>
    <div>
      <p class="text-xs text-surface-400 mb-1">Pengajar</p>
      <p class="text-sm text-surface-700">{{ lecturerNames?.join(', ') || '-' }}</p>
    </div>
  </div>
</template>
