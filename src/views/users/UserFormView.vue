<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import UserFormFields from '@/components/users/UserFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { usersService } from '@/services'
import type { UserPayload } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<UserPayload>({ name: '', email: '', password: '', faculty: '' })
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  if (id.value !== null) {
    const data = await usersService.get(id.value)
    form.name = data.name
    form.email = data.email
    form.faculty = data.faculty ?? ''
  }
})

async function handleSubmit() {
  // Omit an empty password on edit so it doesn't overwrite the current one.
  const payload: UserPayload =
    isEdit.value && !form.password ? { ...form, password: undefined } : form

  await submit(() =>
    isEdit.value ? usersService.update(id.value!, payload) : usersService.create(payload),
  )
  router.push({ name: 'users.index' })
}
</script>

<template>
  <CRUPage page="Pengguna" :type="isEdit ? 'Ubah' : 'Buat'" url="/users">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <UserFormFields :model-value="form" :errors="errors" :is-edit="isEdit" />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'users.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
