<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { activityTypesService } from '@/services'
import type { ActivityType } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<ActivityType[]>([])
const loading = ref(false)

const columns: ResourceColumn<ActivityType>[] = [{ field: 'name', header: 'Nama', sortable: true }]

async function load() {
  loading.value = true
  try {
    rows.value = await activityTypesService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: ActivityType) {
  await activityTypesService.destroy(row.id!)
  toast.success('Tipe aktivitas berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout
    title="Tipe Aktivitas"
    create-to="/activity-types/create"
    create-label="Tambah Tipe Aktivitas"
  >
    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :actions="['edit', 'delete']"
      @edit="(row) => router.push({ name: 'activityTypes.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>
</template>
