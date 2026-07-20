<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import JurusanFormFields from '@/components/jurusans/JurusanFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { jurusansService } from '@/services'
import type { JurusanPayload, Konsentrasi } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<JurusanPayload>({ name: '', faculty: '', jenjang: null, color: null })
const konsentrasi = ref<Konsentrasi[]>([])
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  if (id.value === null) return

  const [data, konsentrasiList] = await Promise.all([
    jurusansService.get(id.value),
    jurusansService.konsentrasi(id.value),
  ])
  // Copy only the writable fields — `id` is not part of JurusanRequest.
  form.name = data.name
  form.faculty = data.faculty ?? ''
  form.jenjang = data.jenjang
  form.color = data.color
  konsentrasi.value = konsentrasiList
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? jurusansService.update(id.value!, form) : jurusansService.create(form),
  )
  router.push({ name: 'jurusans.index' })
}
</script>

<template>
  <CRUPage page="Jurusan" :type="isEdit ? 'Ubah' : 'Buat'" url="/jurusans">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <JurusanFormFields
      :model-value="form"
      :errors="errors"
      :konsentrasi="konsentrasi"
      :is-edit="isEdit"
    />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'jurusans.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
