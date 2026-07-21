<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable, ImportDialog, DownloadMenu } from '@/components/base'
import type { ResourceColumn, ImportEndpoint, DownloadItem } from '@/components/base'
import { activitiesService, semestersService } from '@/services'
import { semesterLabel } from '@/types'
import type { Activity, Semester } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Activity[]>([])
const semesters = ref<Semester[]>([])
const loading = ref(false)
const importVisible = ref(false)

const semesterNameById = computed(
  () => new Map(semesters.value.map((s) => [s.id, semesterLabel(s)])),
)

// `courseName` and `activityTypeName` come denormalized on ActivityResponse, so
// only the semester still needs a client-side lookup.
const columns = computed<ResourceColumn<Activity>[]>(() => [
  {
    field: 'courseName',
    header: 'Matakuliah',
    format: (row) => (row.courseCode ? `${row.courseCode} — ${row.courseName}` : row.courseName),
    sortable: true,
  },
  { field: 'courseClass', header: 'Kelas', sortable: true },
  { field: 'courseSession', header: 'Sesi', sortable: true },
  { field: 'activityTypeName', header: 'Jenis' },
  {
    field: 'semesterId',
    header: 'Semester',
    format: (row) => semesterNameById.value.get(row.semesterId) ?? row.semesterId,
  },
  { field: 'quota', header: 'Kuota', sortable: true },
  { field: 'duration', header: 'Durasi', sortable: true },
])

const importEndpoints: ImportEndpoint[] = [
  {
    key: 'base',
    label: 'Data Aktivitas',
    upload: (file) => activitiesService.uploadActivities(file),
  },
  {
    key: 'all',
    label: 'Semua Aktivitas (Gabungan)',
    upload: (file) => activitiesService.uploadAllActivity(file),
  },
]

const downloadItems: DownloadItem[] = [
  {
    label: 'Template Aktivitas',
    filename: 'template-aktivitas.xlsx',
    action: () => activitiesService.excelActivities(),
  },
]

async function load() {
  loading.value = true
  try {
    const [activities, semesterList] = await Promise.all([
      activitiesService.list(),
      semestersService.list(),
    ])
    rows.value = activities
    semesters.value = semesterList
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Activity) {
  await activitiesService.destroy(row.id!)
  toast.success('Aktivitas berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout
    title="Input Aktivitas"
    create-to="/activities/create"
    create-label="Tambah Aktivitas"
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
      @view="(row) => router.push({ name: 'activities.show', params: { id: String(row.id) } })"
      @edit="(row) => router.push({ name: 'activities.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>

  <ImportDialog
    v-model:visible="importVisible"
    :endpoints="importEndpoints"
    header="Impor Data Aktivitas"
    @uploaded="load"
  />
</template>
