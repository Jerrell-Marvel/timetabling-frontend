<script setup lang="ts">
import type { Course } from '@/types'

defineProps<{ course: Course }>()
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
        <p class="text-xs text-surface-400">Jurusan</p>
        <p class="font-medium text-surface-900">
          {{ course.jurusan?.name ?? course.jurusanId }}
        </p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Tipe</p>
        <p class="font-medium text-surface-900">{{ course.type }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Tingkat</p>
        <p class="font-medium text-surface-900">{{ course.tingkat ?? '-' }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Konsentrasi</p>
        <p class="font-medium text-surface-900">{{ course.konsentrasi || '-' }}</p>
      </div>
    </div>
  </div>
</template>
