<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import LecturerFormFields from '@/components/lecturers/LecturerFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { lecturersService } from '@/services'
import type { Lecturer } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<Lecturer>({ nik: '', name: '', alias: '', times: [] })
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  if (id.value !== null) {
    const data = await lecturersService.get(id.value)
    Object.assign(form, data)
  }
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? lecturersService.update(id.value!, form) : lecturersService.create(form),
  )
  router.push({ name: 'lecturers.index' })
}
</script>

<template>
  <CRUPage page="Pengajar" :type="isEdit ? 'Ubah' : 'Buat'" url="/lecturers">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <LecturerFormFields :model-value="form" :errors="errors" />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'lecturers.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
