<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import CourseFormFields from '@/components/courses/CourseFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { coursesService, jurusansService } from '@/services'
import type { CoursePayload, Jurusan } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<CoursePayload>({
  code: '',
  name: '',
  type: 'Pilihan',
  tingkat: null,
  konsentrasi: null,
  jurusanId: 0,
  // Always sent, so the form is the single source of truth for both conflict sets.
  courseConstraints: [],
  semesterConstraints: [],
})
const jurusans = ref<Jurusan[]>([])
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  const [jurusanList, data, constraints] = await Promise.all([
    jurusansService.list(),
    id.value !== null ? coursesService.get(id.value) : Promise.resolve(null),
    id.value !== null ? coursesService.constraints(id.value) : Promise.resolve(null),
  ])
  jurusans.value = jurusanList

  if (data) {
    // Copy only the writable fields — `jurusan`/`color`/`id` are read-only.
    form.code = data.code
    form.name = data.name
    form.type = data.type
    form.tingkat = data.tingkat
    form.konsentrasi = data.konsentrasi ?? null
    form.jurusanId = data.jurusanId
  }
  if (constraints) {
    form.courseConstraints = constraints.courseIds
    form.semesterConstraints = constraints.semesters
  }
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? coursesService.update(id.value!, form) : coursesService.create(form),
  )
  router.push({ name: 'courses.index' })
}
</script>

<template>
  <CRUPage page="Matakuliah" :type="isEdit ? 'Ubah' : 'Buat'" url="/courses">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <CourseFormFields
      v-model="form"
      :errors="errors"
      :jurusans="jurusans"
      :current-course-id="id"
    />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'courses.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
