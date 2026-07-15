<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import ProdiFormFields from '@/components/prodis/ProdiFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { prodisService } from '@/services'
import type { Prodi } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<Prodi>({
  name: '',
  faculty: '',
  degree: '',
  color: 'ff0000',
  concentrations: [],
})
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  if (id.value !== null) {
    const data = await prodisService.get(id.value)
    Object.assign(form, data)
  }
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? prodisService.update(id.value!, form) : prodisService.create(form),
  )
  router.push({ name: 'prodis.index' })
}
</script>

<template>
  <CRUPage page="Program Studi" :type="isEdit ? 'Ubah' : 'Buat'" url="/prodis">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <ProdiFormFields :model-value="form" :errors="errors" />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'prodis.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
