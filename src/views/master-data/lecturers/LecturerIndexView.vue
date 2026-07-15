<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable, ImportDialog, DownloadMenu } from '@/components/base'
import type { ResourceColumn, ImportEndpoint, DownloadItem } from '@/components/base'
import { lecturersService } from '@/services'
import type { Lecturer } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Lecturer[]>([])
const loading = ref(false)
const importVisible = ref(false)

const columns: ResourceColumn[] = [
  { field: 'nik', header: 'NIK', sortable: true },
  { field: 'name', header: 'Nama', sortable: true },
  { field: 'alias', header: 'Alias' },
]

const importEndpoints: ImportEndpoint[] = [
  {
    key: 'base',
    label: 'Data Pengajar',
    upload: (file) => lecturersService.uploadLecturer(file),
  },
  {
    key: 'time',
    label: 'Waktu Pengajar',
    upload: (file) => lecturersService.uploadLecturerTime(file),
  },
]

const downloadItems: DownloadItem[] = [
  {
    label: 'Template Pengajar',
    filename: 'template-pengajar.xlsx',
    action: () => lecturersService.excelLecturer(),
  },
  {
    label: 'Template Waktu Pengajar',
    filename: 'template-waktu-pengajar.xlsx',
    action: () => lecturersService.excelLecturerTime(),
  },
]

async function load() {
  loading.value = true
  try {
    rows.value = await lecturersService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Lecturer) {
  await lecturersService.destroy(row.id!)
  toast.success('Pengajar berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout
    title="Pengajar"
    create-to="/lecturers/create"
    create-label="Tambah Pengajar"
  >
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
      @view="(row) => router.push({ name: 'lecturers.show', params: { id: String(row.id) } })"
      @edit="(row) => router.push({ name: 'lecturers.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>

  <ImportDialog
    v-model:visible="importVisible"
    :endpoints="importEndpoints"
    header="Impor Data Pengajar"
    @uploaded="load"
  />
</template>
