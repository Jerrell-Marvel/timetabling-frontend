<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { prodisService } from '@/services'
import type { Prodi } from '@/types'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const rows = ref<Prodi[]>([])
const loading = ref(false)

const columns: ResourceColumn<Prodi>[] = [
  { field: 'name', header: 'Nama', sortable: true },
  { field: 'faculty', header: 'Fakultas' },
  { field: 'degree', header: 'Jenjang' },
]

async function load() {
  loading.value = true
  try {
    rows.value = await prodisService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function onDelete(row: Prodi) {
  await prodisService.destroy(row.id!)
  toast.success('Program studi berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout title="Program Studi" create-to="/prodis/create" create-label="Tambah Prodi">
    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :actions="['edit', 'delete']"
      @edit="(row) => router.push({ name: 'prodis.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>
</template>
