<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { jurusansService } from '@/services'
import type { Jurusan } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Jurusan[]>([])
const loading = ref(false)

const columns: ResourceColumn<Jurusan>[] = [
  { field: 'name', header: 'Nama', sortable: true },
  { field: 'faculty', header: 'Fakultas' },
  { field: 'jenjang', header: 'Jenjang', sortable: true },
]

async function load() {
  loading.value = true
  try {
    rows.value = await jurusansService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Jurusan) {
  // Not awaited by `emit` — swallow rejections (the interceptor toasts the reason).
  try {
    await jurusansService.destroy(row.id)
  } catch {
    return
  }
  toast.success('Jurusan berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout title="Jurusan" create-to="/jurusans/create" create-label="Tambah Jurusan">
    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :actions="['edit', 'delete']"
      @edit="(row) => router.push({ name: 'jurusans.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>
</template>
