<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { settingsService } from '@/services'
import type { Setting } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Setting[]>([])
const loading = ref(false)

// `SettingResponse` already carries the semester label, so no second request.
const columns: ResourceColumn<Setting>[] = [
  { field: 'name', header: 'Nama', sortable: true },
  {
    field: 'typeAndSemester',
    header: 'Semester',
    format: (row) => row.typeAndSemester ?? '-',
  },
]

async function load() {
  loading.value = true
  try {
    rows.value = await settingsService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Setting) {
  // Not awaited by `emit` — swallow rejections (the interceptor toasts the reason).
  try {
    await settingsService.destroy(row.id)
  } catch {
    return
  }
  toast.success('Pengaturan berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout
    title="Pengaturan Penjadwalan"
    create-to="/settings/create"
    create-label="Tambah Pengaturan"
  >
    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :actions="['edit', 'delete']"
      @edit="(row) => router.push({ name: 'settings.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>
</template>
