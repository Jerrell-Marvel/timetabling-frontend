<script setup lang="ts">
/**
 * Replaces `MultipleTimeSlotComponent`. Used twice on the Lecturer form — once
 * per `type` (`NOT_AVAILABLE` / `PRIORITY`) — with two separate `modelValue`
 * arrays. Rows mutate in place (the caller's `modelValue` is expected to live
 * inside a `reactive()` form).
 */
import RepeatableRows from './RepeatableRows.vue'
import type { LecturerTime, LecturerTimeType } from '@/types'

const props = defineProps<{
  modelValue: LecturerTime[]
  type: LecturerTimeType
}>()
defineEmits<{ 'update:modelValue': [value: LecturerTime[]] }>()

// `day` is the backend's 1-based index (1 = Senin … 6 = Sabtu).
const dayOptions = [
  { label: 'Senin', value: 1 },
  { label: 'Selasa', value: 2 },
  { label: 'Rabu', value: 3 },
  { label: 'Kamis', value: 4 },
  { label: 'Jumat', value: 5 },
  { label: 'Sabtu', value: 6 },
]

function newRow(): LecturerTime {
  return { day: 1, startTime: '07:00', endTime: '08:00', type: props.type }
}

function toDate(value: string): Date | null {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(h ?? 0, m ?? 0, 0, 0)
  return date
}

function fromDate(value: unknown): string {
  if (!(value instanceof Date)) return ''
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <RepeatableRows
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :new-row="newRow"
    add-label="Tambah Waktu"
  >
    <template #row="{ row }">
      <div class="grid grid-cols-3 gap-2">
        <Select
          v-model="row.day"
          :options="dayOptions"
          option-label="label"
          option-value="value"
          placeholder="Hari"
        />
        <DatePicker
          :model-value="toDate(row.startTime)"
          @update:model-value="row.startTime = fromDate($event)"
          time-only
          hour-format="24"
          placeholder="Mulai"
        />
        <DatePicker
          :model-value="toDate(row.endTime)"
          @update:model-value="row.endTime = fromDate($event)"
          time-only
          hour-format="24"
          placeholder="Selesai"
        />
      </div>
    </template>
  </RepeatableRows>
</template>
