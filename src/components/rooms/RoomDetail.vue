<script setup lang="ts">
import { isClosed, type Room, type RoomAvailability } from '@/types'

defineProps<{
  room: Room
  /** Resolved from `parentRoomId` by the parent view (not embedded in the payload). */
  parentName?: string
}>()

/** `day` is 1-based (1 = Senin … 6 = Sabtu); index 0 is unused padding. */
const DAY_LABELS = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function formatSlot(a: RoomAvailability): string {
  const label = DAY_LABELS[a.day] ?? '-'
  // Every room carries all six days; a closed one is stored as 00:00–00:00.
  return isClosed(a) ? `${label}: Tutup` : `${label}: ${a.startTime} - ${a.endTime}`
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <p class="text-xs text-surface-400">Kode</p>
        <p class="font-medium text-surface-900">{{ room.roomCode }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Nama</p>
        <p class="font-medium text-surface-900">{{ room.name }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Unit Pemilik</p>
        <p class="font-medium text-surface-900">{{ room.unitOwner || '-' }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Lokasi</p>
        <p class="font-medium text-surface-900">{{ room.location }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Gedung</p>
        <p class="font-medium text-surface-900">{{ room.building }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Lantai</p>
        <p class="font-medium text-surface-900">{{ room.floor }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Kapasitas</p>
        <p class="font-medium text-surface-900">{{ room.capacity }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Tipe Ruangan</p>
        <p class="font-medium text-surface-900">{{ room.roomType?.name ?? room.roomTypeId }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Ruangan Induk</p>
        <p class="font-medium text-surface-900">{{ parentName ?? '-' }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Virtual</p>
        <p class="font-medium text-surface-900">{{ room.virtual || '-' }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Sub-Ruangan</p>
        <p class="font-medium text-surface-900">{{ room.childIds?.length ?? 0 }}</p>
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Ketersediaan Ruangan</h3>
      <p v-if="!room.availabilities?.length" class="text-sm text-surface-400">Tidak ada data.</p>
      <ul v-else class="flex flex-col gap-1">
        <li
          v-for="(a, i) in room.availabilities"
          :key="a.id ?? i"
          class="text-sm text-surface-700"
        >
          {{ formatSlot(a) }}
        </li>
      </ul>
    </div>
  </div>
</template>
