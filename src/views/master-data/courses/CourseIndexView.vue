<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable, ImportDialog, DownloadMenu } from '@/components/base'
import type { ResourceColumn, ImportEndpoint, DownloadItem } from '@/components/base'
import { coursesService } from '@/services'
import type { Course } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Course[]>([])
const loading = ref(false)
const importVisible = ref(false)

// `CourseResponse` embeds the full `jurusan`, so no second request is needed.
const columns: ResourceColumn<Course>[] = [
  { field: 'code', header: 'Kode', sortable: true },
  { field: 'name', header: 'Nama', sortable: true },
  {
    field: 'jurusanId',
    header: 'Jurusan',
    format: (row) => row.jurusan?.name ?? row.jurusanId,
  },
  { field: 'tingkat', header: 'Tingkat', sortable: true },
]

const importEndpoints: ImportEndpoint[] = [
  { key: 'base', label: 'Data Matakuliah', upload: (file) => coursesService.uploadCourse(file) },
]

const downloadItems: DownloadItem[] = [
  {
    label: 'Template Matakuliah',
    filename: 'template-matakuliah.xlsx',
    action: () => coursesService.excelCourse(),
  },
]

async function load() {
  loading.value = true
  try {
    rows.value = await coursesService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Course) {
  // Not awaited by `emit` — swallow rejections (the interceptor toasts the reason).
  try {
    await coursesService.destroy(row.id!)
  } catch {
    return
  }
  toast.success('Matakuliah berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout
    title="Matakuliah"
    create-to="/courses/create"
    create-label="Tambah Matakuliah"
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
      @view="(row) => router.push({ name: 'courses.show', params: { id: String(row.id) } })"
      @edit="(row) => router.push({ name: 'courses.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>

  <ImportDialog
    v-model:visible="importVisible"
    :endpoints="importEndpoints"
    header="Impor Data Matakuliah"
    @uploaded="load"
  />
</template>
