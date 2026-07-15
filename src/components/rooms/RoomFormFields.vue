<script setup lang="ts">
/** Six-day availability grid replaces the legacy per-day checkbox+time rows. */
import type { Room, Option } from '@/types'

defineProps<{
  errors?: Record<string, string>
  roomTypeOptions: Option[]
  parentOptions: Option[]
}>()

const modelValue = defineModel<Room>({ required: true })

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function entryFor(day: string) {
  return modelValue.value.availabilities.find((a) => a.day === day)
}

function isEnabled(day: string) {
  return entryFor(day) !== undefined
}

function toggleDay(day: string, enabled: boolean) {
  if (enabled) {
    modelValue.value.availabilities = [
      ...modelValue.value.availabilities,
      { day, start: '07:00', end: '17:00' },
    ]
  } else {
    modelValue.value.availabilities = modelValue.value.availabilities.filter(
      (a) => a.day !== day,
    )
  }
}

function setTime(day: string, key: 'start' | 'end', value: string) {
  const entry = entryFor(day)
  if (entry) entry[key] = value
}

function toDate(value?: string): Date | null {
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
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Kode</label>
        <InputText v-model="modelValue.code" class="w-full" :invalid="!!errors?.code" />
        <Message v-if="errors?.code" severity="error" size="small" variant="simple">{{
          errors.code
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Pemilik</label>
        <InputText v-model="modelValue.owner" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Kampus</label>
        <InputText v-model="modelValue.campus" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Gedung</label>
        <InputText v-model="modelValue.building" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Lantai</label>
        <InputText v-model="modelValue.floor" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Kapasitas</label>
        <InputNumber v-model="modelValue.capacity" :min="0" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Tipe Ruangan</label>
        <Select
          v-model="modelValue.room_type_id"
          :options="roomTypeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Ruangan Induk</label>
        <Select
          v-model="modelValue.parent_id"
          :options="parentOptions"
          option-label="label"
          option-value="value"
          show-clear
          class="w-full"
        />
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Ketersediaan Ruangan</h3>
      <div class="flex flex-col gap-2">
        <div
          v-for="day in days"
          :key="day"
          class="grid grid-cols-4 items-center gap-2 p-2 bg-surface-50 rounded-lg border border-surface-100"
        >
          <label class="flex items-center gap-2 text-sm text-surface-700">
            <Checkbox
              :model-value="isEnabled(day)"
              binary
              @update:model-value="(v) => toggleDay(day, v)"
            />
            {{ day }}
          </label>
          <DatePicker
            :model-value="toDate(entryFor(day)?.start)"
            @update:model-value="setTime(day, 'start', fromDate($event))"
            time-only
            hour-format="24"
            placeholder="Mulai"
            :disabled="!isEnabled(day)"
          />
          <DatePicker
            :model-value="toDate(entryFor(day)?.end)"
            @update:model-value="setTime(day, 'end', fromDate($event))"
            time-only
            hour-format="24"
            placeholder="Selesai"
            :disabled="!isEnabled(day)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
