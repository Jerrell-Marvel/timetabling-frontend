<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { roomsService } from '@/services'
import type { Room } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Room[]>([])
const loading = ref(false)

// `RoomResponse` embeds `roomType`, so no second request is needed.
const columns: ResourceColumn<Room>[] = [
  { field: 'roomCode', header: 'Kode', sortable: true },
  { field: 'name', header: 'Nama', sortable: true },
  { field: 'location', header: 'Lokasi' },
  { field: 'building', header: 'Gedung' },
  { field: 'capacity', header: 'Kapasitas', sortable: true },
  {
    field: 'roomTypeId',
    header: 'Tipe',
    format: (row) => row.roomType?.name ?? row.roomTypeId,
  },
]

async function load() {
  loading.value = true
  try {
    rows.value = await roomsService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Room) {
  // Not awaited by `emit` — swallow rejections (the interceptor toasts the reason).
  try {
    await roomsService.destroy(row.id)
  } catch {
    return
  }
  toast.success('Ruangan berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout title="Ruangan" create-to="/rooms/create" create-label="Tambah Ruangan">
    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      @view="(row) => router.push({ name: 'rooms.show', params: { id: String(row.id) } })"
      @edit="(row) => router.push({ name: 'rooms.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>
</template>
