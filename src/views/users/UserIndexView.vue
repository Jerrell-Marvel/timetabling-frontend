<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ResourceListLayout, ResourceTable } from '@/components/base'
import type { ResourceColumn } from '@/components/base'
import { usersService } from '@/services'
import type { User } from '@/types'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const rows = ref<User[]>([])
const loading = ref(false)

const columns: ResourceColumn<User>[] = [
  { field: 'name', header: 'Nama', sortable: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'faculty', header: 'Fakultas' },
  { field: 'admin', header: 'Admin', format: (row) => (row.admin ? 'Ya' : 'Tidak') },
]

async function load() {
  loading.value = true
  try {
    rows.value = await usersService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

// A user cannot delete their own account (legacy UserController rule).
function canDelete(row: User) {
  return row.id !== authStore.user?.id
}

async function onDelete(row: User) {
  // Not awaited by `emit` — swallow rejections (the interceptor toasts the reason).
  try {
    await usersService.destroy(row.id)
  } catch {
    return
  }
  toast.success('Pengguna berhasil dihapus.')
  await load()
}
</script>

<template>
  <ResourceListLayout title="Pengguna" create-to="/users/create" create-label="Tambah Pengguna">
    <ResourceTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :actions="['edit', 'delete']"
      :can-delete="canDelete"
      @edit="(row) => router.push({ name: 'users.edit', params: { id: String(row.id) } })"
      @delete="onDelete"
    />
  </ResourceListLayout>
</template>
