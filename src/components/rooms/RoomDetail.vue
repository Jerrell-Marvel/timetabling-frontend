<script setup lang="ts">
import type { Room } from '@/types'

defineProps<{
  room: Room
  roomTypeName?: string
  parentName?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <p class="text-xs text-surface-400">Kode</p>
        <p class="font-medium text-surface-900">{{ room.code }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Pemilik</p>
        <p class="font-medium text-surface-900">{{ room.owner || '-' }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Kampus</p>
        <p class="font-medium text-surface-900">{{ room.campus }}</p>
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
        <p class="font-medium text-surface-900">{{ roomTypeName ?? room.room_type_id }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-400">Ruangan Induk</p>
        <p class="font-medium text-surface-900">{{ parentName ?? '-' }}</p>
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Ketersediaan Ruangan</h3>
      <p v-if="room.availabilities.length === 0" class="text-sm text-surface-400">
        Tidak ada data.
      </p>
      <ul v-else class="flex flex-col gap-1">
        <li v-for="a in room.availabilities" :key="a.day" class="text-sm text-surface-700">
          {{ a.day }}: {{ a.start }} - {{ a.end }}
        </li>
      </ul>
    </div>
  </div>
</template>
