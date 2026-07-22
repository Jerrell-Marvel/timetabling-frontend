<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import JurusanFormFields from '@/components/jurusans/JurusanFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { jurusansService, konsentrasiService } from '@/services'
import type { JurusanPayload, Konsentrasi, KonsentrasiDraft } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<JurusanPayload>({ name: '', faculty: '', jenjang: null, color: null })

/** Editable drafts, plus the server state they are diffed against on save. */
const konsentrasi = ref<KonsentrasiDraft[]>([])
const originalKonsentrasi = ref<Konsentrasi[]>([])

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

  originalKonsentrasi.value = konsentrasiList
  konsentrasi.value = konsentrasiList.map((k) => ({ id: k.id, konsentrasi: k.konsentrasi }))
})

async function handleSubmit() {
  await submit(async () => {
    // The jurusan must exist before its concentrations can reference it, so on
    // create we save it first and only then reconcile.
    const saved = isEdit.value
      ? await jurusansService.update(id.value!, form)
      : await jurusansService.create(form)

    await konsentrasiService.reconcile(saved.id, konsentrasi.value, originalKonsentrasi.value)
    return saved
  })
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

    <JurusanFormFields v-model="form" v-model:konsentrasi="konsentrasi" :errors="errors" />

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
