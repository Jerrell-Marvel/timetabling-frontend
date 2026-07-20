<script setup lang="ts">
/**
 * Fields mirror `RoomRequest` exactly. The availability grid writes
 * `{ day: 1..6, startTime, endTime }` — the backend keys days numerically
 * (1 = Senin … 6 = Sabtu), not by Indonesian name.
 */
import type { Option, RoomPayload } from '@/types'

defineProps<{
  errors?: Record<string, string>
  roomTypeOptions: Option[]
  parentOptions: Option[]
}>()

const modelValue = defineModel<RoomPayload>({ required: true })

const days: { label: string; value: number }[] = [
  { label: 'Senin', value: 1 },
  { label: 'Selasa', value: 2 },
  { label: 'Rabu', value: 3 },
  { label: 'Kamis', value: 4 },
  { label: 'Jumat', value: 5 },
  { label: 'Sabtu', value: 6 },
]

function entryFor(day: number) {
  return modelValue.value.availabilities.find((a) => a.day === day)
}

function isEnabled(day: number) {
  return entryFor(day) !== undefined
}

function toggleDay(day: number, enabled: boolean) {
  if (enabled) {
    modelValue.value.availabilities = [
      ...modelValue.value.availabilities,
      // `roomId` is a required-but-ignored placeholder; the server re-links it.
      { roomId: 0, day, startTime: '07:00', endTime: '17:00' },
    ]
  } else {
    modelValue.value.availabilities = modelValue.value.availabilities.filter((a) => a.day !== day)
  }
}

function setTime(day: number, key: 'startTime' | 'endTime', value: string) {
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
        <InputText v-model="modelValue.roomCode" class="w-full" :invalid="!!errors?.roomCode" />
        <Message v-if="errors?.roomCode" severity="error" size="small" variant="simple">{{
          errors.roomCode
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
        <label class="block text-sm font-medium text-surface-700 mb-1">Unit Pemilik</label>
        <InputText v-model="modelValue.unitOwner" class="w-full" :invalid="!!errors?.unitOwner" />
        <Message v-if="errors?.unitOwner" severity="error" size="small" variant="simple">{{
          errors.unitOwner
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Lokasi</label>
        <InputText v-model="modelValue.location" class="w-full" :invalid="!!errors?.location" />
        <Message v-if="errors?.location" severity="error" size="small" variant="simple">{{
          errors.location
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Gedung</label>
        <InputText v-model="modelValue.building" class="w-full" :invalid="!!errors?.building" />
        <Message v-if="errors?.building" severity="error" size="small" variant="simple">{{
          errors.building
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Lantai</label>
        <InputText v-model="modelValue.floor" class="w-full" :invalid="!!errors?.floor" />
        <Message v-if="errors?.floor" severity="error" size="small" variant="simple">{{
          errors.floor
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Kapasitas</label>
        <InputNumber v-model="modelValue.capacity" :min="0" class="w-full" :invalid="!!errors?.capacity" />
        <Message v-if="errors?.capacity" severity="error" size="small" variant="simple">{{
          errors.capacity
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Tipe Ruangan</label>
        <Select
          v-model="modelValue.roomTypeId"
          :options="roomTypeOptions"
          option-label="label"
          option-value="value"
          placeholder="Pilih Tipe"
          class="w-full"
          :invalid="!!errors?.roomTypeId"
        />
        <Message v-if="errors?.roomTypeId" severity="error" size="small" variant="simple">{{
          errors.roomTypeId
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Ruangan Induk</label>
        <Select
          v-model="modelValue.parentRoomId"
          :options="parentOptions"
          option-label="label"
          option-value="value"
          show-clear
          placeholder="Tidak ada"
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Virtual</label>
        <InputText v-model="modelValue.virtual" class="w-full" />
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Ketersediaan Ruangan</h3>
      <div class="flex flex-col gap-2">
        <div
          v-for="day in days"
          :key="day.value"
          class="grid grid-cols-4 items-center gap-2 p-2 bg-surface-50 rounded-lg border border-surface-100"
        >
          <label class="flex items-center gap-2 text-sm text-surface-700">
            <Checkbox
              :model-value="isEnabled(day.value)"
              binary
              @update:model-value="(v) => toggleDay(day.value, v)"
            />
            {{ day.label }}
          </label>
          <DatePicker
            :model-value="toDate(entryFor(day.value)?.startTime)"
            @update:model-value="setTime(day.value, 'startTime', fromDate($event))"
            time-only
            hour-format="24"
            placeholder="Mulai"
            :disabled="!isEnabled(day.value)"
          />
          <DatePicker
            :model-value="toDate(entryFor(day.value)?.endTime)"
            @update:model-value="setTime(day.value, 'endTime', fromDate($event))"
            time-only
            hour-format="24"
            placeholder="Selesai"
            :disabled="!isEnabled(day.value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
