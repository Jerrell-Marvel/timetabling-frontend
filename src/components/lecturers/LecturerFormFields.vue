<script setup lang="ts">
import { computed } from 'vue'
import TimeRangeList from '@/components/controls/TimeRangeList.vue'
import type { Lecturer, LecturerTime } from '@/types'

defineProps<{
  errors?: Record<string, string>
}>()

const modelValue = defineModel<Lecturer>({ required: true })

const unavailableTimes = computed<LecturerTime[]>({
  get: () => modelValue.value.times.filter((t) => t.type === 'Unavailable'),
  set: (value) => {
    modelValue.value.times = [
      ...modelValue.value.times.filter((t) => t.type !== 'Unavailable'),
      ...value,
    ]
  },
})

const priorityTimes = computed<LecturerTime[]>({
  get: () => modelValue.value.times.filter((t) => t.type === 'Priority'),
  set: (value) => {
    modelValue.value.times = [
      ...modelValue.value.times.filter((t) => t.type !== 'Priority'),
      ...value,
    ]
  },
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">NIK</label>
        <InputText v-model="modelValue.nik" class="w-full" :invalid="!!errors?.nik" />
        <Message v-if="errors?.nik" severity="error" size="small" variant="simple">{{
          errors.nik
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Nama</label>
        <InputText v-model="modelValue.name" class="w-full" :invalid="!!errors?.name" />
        <Message v-if="errors?.name" severity="error" size="small" variant="simple">{{
          errors.name
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Alias</label>
        <InputText v-model="modelValue.alias" class="w-full" />
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Waktu Tidak Tersedia</h3>
      <TimeRangeList v-model="unavailableTimes" type="Unavailable" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Waktu Preferensi</h3>
      <TimeRangeList v-model="priorityTimes" type="Priority" />
    </div>
  </div>
</template>
