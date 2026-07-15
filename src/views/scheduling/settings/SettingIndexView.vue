<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { settingsService, semestersService } from '@/services'
import type { Setting, Semester } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Setting[]>([])
const semesters = ref<Semester[]>([])
const loading = ref(false)

const semesterNameById = computed(() => new Map(semesters.value.map((s) => [s.id, s.name])))

const columns = computed<ResourceColumn<Setting>[]>(() => [
  { field: 'name', header: 'Nama', sortable: true },
  {
    field: 'semester_id',
    header: 'Semester',
    format: (row) => semesterNameById.value.get(row.semester_id) ?? row.semester_id,
  },
])

async function load() {
  loading.value = true
  try {
    const [settings, semesterList] = await Promise.all([
      settingsService.list(),
      semestersService.list(),
    ])
    rows.value = settings
    semesters.value = semesterList
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Setting) {
  await settingsService.destroy(row.id!)
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
