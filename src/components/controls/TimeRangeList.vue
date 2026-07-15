<script setup lang="ts">
/**
 * Replaces `MultipleTimeSlotComponent`. Used twice on the Lecturer form — once
 * per `type` (`Unavailable` / `Priority`, legacy `lecturer_times.type`) — with
 * two separate `modelValue` arrays. Rows mutate in place (the caller's
 * `modelValue` is expected to live inside a `reactive()` form).
 */
import RepeatableRows from './RepeatableRows.vue'
import type { LecturerTime } from '@/types'

const props = defineProps<{
  modelValue: LecturerTime[]
  type: 'Unavailable' | 'Priority'
}>()
defineEmits<{ 'update:modelValue': [value: LecturerTime[]] }>()

const dayOptions = [
  { label: 'Senin', value: 'Senin' },
  { label: 'Selasa', value: 'Selasa' },
  { label: 'Rabu', value: 'Rabu' },
  { label: 'Kamis', value: 'Kamis' },
  { label: 'Jumat', value: 'Jumat' },
  { label: 'Sabtu', value: 'Sabtu' },
]

function newRow(): LecturerTime {
  return { day: 'Senin', start: '07:00', end: '08:00', type: props.type }
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
          :model-value="toDate(row.start)"
          @update:model-value="row.start = fromDate($event)"
          time-only
          hour-format="24"
          placeholder="Mulai"
        />
        <DatePicker
          :model-value="toDate(row.end)"
          @update:model-value="row.end = fromDate($event)"
          time-only
          hour-format="24"
          placeholder="Selesai"
        />
      </div>
    </template>
  </RepeatableRows>
</template>
