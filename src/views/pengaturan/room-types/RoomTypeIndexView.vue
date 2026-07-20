<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { roomTypesService } from '@/services'
import type { RoomType } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<RoomType[]>([])
const loading = ref(false)

const columns: ResourceColumn<RoomType>[] = [{ field: 'name', header: 'Nama', sortable: true }]

async function load() {
  loading.value = true
  try {
    rows.value = await roomTypesService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: RoomType) {
  // Not awaited by `emit` — swallow rejections (the interceptor toasts the reason).
  try {
    await roomTypesService.destroy(row.id)
  } catch {
    return
  }
  toast.success('Tipe ruangan berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout
    title="Tipe Ruangan"
    create-to="/room-types/create"
    create-label="Tambah Tipe Ruangan"
  >
    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :actions="['edit', 'delete']"
      @edit="(row) => router.push({ name: 'roomTypes.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>
</template>
