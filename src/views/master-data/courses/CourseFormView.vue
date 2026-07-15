<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import CourseFormFields from '@/components/courses/CourseFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { coursesService, prodisService } from '@/services'
import type { Course, Option } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<Course>({
  code: '',
  name: '',
  prodi_id: 0,
  type: 'Wajib',
  semester: 1,
  concentration: null,
  prohibited_course_ids: [],
  prohibited_semesters: [],
})
const prodiOptions = ref<Option[]>([])
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  const prodis = await prodisService.list()
  prodiOptions.value = prodis.map((p) => ({ label: p.name, value: p.id! }))

  if (id.value !== null) {
    const data = await coursesService.get(id.value)
    Object.assign(form, data)
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

    <CourseFormFields :model-value="form" :errors="errors" :prodi-options="prodiOptions" />

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
