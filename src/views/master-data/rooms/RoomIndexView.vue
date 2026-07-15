<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable, ImportDialog, DownloadMenu } from '@/components/base'
import type { ResourceColumn, ImportEndpoint, DownloadItem } from '@/components/base'
import { roomsService, roomTypesService } from '@/services'
import type { Room, RoomType } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Room[]>([])
const roomTypes = ref<RoomType[]>([])
const loading = ref(false)
const importVisible = ref(false)

const roomTypeNameById = computed(() => new Map(roomTypes.value.map((rt) => [rt.id, rt.name])))

const columns = computed<ResourceColumn<Room>[]>(() => [
  { field: 'code', header: 'Kode', sortable: true },
  { field: 'campus', header: 'Kampus' },
  { field: 'building', header: 'Gedung' },
  { field: 'capacity', header: 'Kapasitas', sortable: true },
  {
    field: 'room_type_id',
    header: 'Tipe',
    format: (row) => roomTypeNameById.value.get(row.room_type_id) ?? row.room_type_id,
  },
])

const importEndpoints: ImportEndpoint[] = [
  { key: 'base', label: 'Data Ruangan', upload: (file) => roomsService.uploadRoom(file) },
]

const downloadItems: DownloadItem[] = [
  {
    label: 'Template Ruangan',
    filename: 'template-ruangan.xlsx',
    action: () => roomsService.excelRoom(),
  },
]

async function load() {
  loading.value = true
  try {
    const [rooms, types] = await Promise.all([roomsService.list(), roomTypesService.list()])
    rows.value = rooms
    roomTypes.value = types
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Room) {
  await roomsService.destroy(row.id!)
  toast.success('Ruangan berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout title="Ruangan" create-to="/rooms/create" create-label="Tambah Ruangan">
    <template #actions>
      <DownloadMenu :items="downloadItems" label="Unduh Template" />
      <Button
        label="Impor"
        icon="pi pi-upload"
        severity="secondary"
        @click="importVisible = true"
      />
    </template>

    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      @view="(row) => router.push({ name: 'rooms.show', params: { id: String(row.id) } })"
      @edit="(row) => router.push({ name: 'rooms.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>

  <ImportDialog
    v-model:visible="importVisible"
    :endpoints="importEndpoints"
    header="Impor Data Ruangan"
    @uploaded="load"
  />
</template>
