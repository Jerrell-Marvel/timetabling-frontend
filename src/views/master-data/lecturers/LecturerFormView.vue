<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import LecturerFormFields from '@/components/lecturers/LecturerFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { jurusansService, lecturersService } from '@/services'
import type { Jurusan, Lecturer, LecturerTime } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<Lecturer>({
  nik: '',
  name: '',
  homeBase: null,
  alias: '',
  notAvailable: [],
  priority: [],
})
const { errors, processing, submit } = useApiForm()

const jurusans = ref<Jurusan[]>([])
/**
 * The time rows exactly as the server returned them. Compared against the form
 * on submit so rows the user removed can be DELETEd. Empty when creating.
 */
const originalTimes = ref<LecturerTime[]>([])

onMounted(async () => {
  const [jurusanList, data] = await Promise.all([
    jurusansService.list(),
    id.value !== null ? lecturersService.get(id.value) : Promise.resolve(null),
  ])
  jurusans.value = jurusanList

  if (data) {
    Object.assign(form, data)
    // Snapshot before the form can mutate the arrays in place.
    originalTimes.value = [...(data.notAvailable ?? []), ...(data.priority ?? [])]
  }
})

async function handleSubmit() {
  await submit(() => lecturersService.save(id.value, form, originalTimes.value))
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

    <LecturerFormFields :model-value="form" :errors="errors" :jurusans="jurusans" />

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
