<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import { useApiForm } from '@/composables/useApiForm'
import { roomTypesService } from '@/services'
import type { RoomTypePayload } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

// `RoomTypeRequest` accepts only `name` — `id` is not part of the payload.
const form = reactive<RoomTypePayload>({ name: '' })
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  if (id.value !== null) {
    const data = await roomTypesService.get(id.value)
    form.name = data.name
  }
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? roomTypesService.update(id.value!, form) : roomTypesService.create(form),
  )
  router.push({ name: 'roomTypes.index' })
}
</script>

<template>
  <CRUPage page="Tipe Ruangan" :type="isEdit ? 'Ubah' : 'Buat'" url="/room-types">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <div class="max-w-md">
      <label class="block text-sm font-medium text-surface-700 mb-1">Nama</label>
      <InputText v-model="form.name" class="w-full" :invalid="!!errors.name" />
      <Message v-if="errors.name" severity="error" size="small" variant="simple">{{
        errors.name
      }}</Message>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'roomTypes.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
