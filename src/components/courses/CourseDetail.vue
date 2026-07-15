<script setup lang="ts">
import type { Course } from '@/types'

defineProps<{
  course: Course
  prodiName?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <p class="text-xs text-surface-400">Kode</p>
        <p class="font-medium text-surface-900">{{ course.code }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Nama</p>
        <p class="font-medium text-surface-900">{{ course.name }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Program Studi</p>
        <p class="font-medium text-surface-900">{{ prodiName ?? course.prodi_id }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Tipe</p>
        <p class="font-medium text-surface-900">{{ course.type }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Semester</p>
        <p class="font-medium text-surface-900">{{ course.semester }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Konsentrasi</p>
        <p class="font-medium text-surface-900">{{ course.concentration || '-' }}</p>
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Semester Bentrok</h3>
      <p v-if="course.prohibited_semesters.length === 0" class="text-sm text-surface-400">
        Tidak ada.
      </p>
      <div v-else class="flex flex-wrap gap-2">
        <span
          v-for="s in course.prohibited_semesters"
          :key="s"
          class="px-2 py-1 rounded-md bg-surface-100 text-xs text-surface-700"
        >
          Semester {{ s }}
        </span>
      </div>
    </div>
  </div>
</template>
