<script setup lang="ts">
/**
 * Dependent fetches (the trickiest parity point): selecting a program studi
 * reloads the concentration options (`konsentrasi/{id}`) and the candidate
 * conflict-course options (`courselist/{id}`), showing each control's loading
 * state while in flight — matching legacy `MultipleCoursesComponent`.
 */
import { ref, watch } from 'vue'
import SemesterConflictList from '@/components/controls/SemesterConflictList.vue'
import CourseConflictList from '@/components/controls/CourseConflictList.vue'
import { coursesService } from '@/services'
import type { Course, Option } from '@/types'

defineProps<{
  errors?: Record<string, string>
  prodiOptions: Option[]
}>()

const modelValue = defineModel<Course>({ required: true })

const typeOptions = [
  { label: 'Wajib', value: 'Wajib' },
  { label: 'Pilihan', value: 'Pilihan' },
]
const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
  label: `Semester ${i + 1}`,
  value: i + 1,
}))

const concentrationOptions = ref<Option<string>[]>([])
const courseOptions = ref<Option[]>([])
const loadingConcentration = ref(false)
const loadingCourses = ref(false)

async function loadDependent(prodiId: number) {
  loadingConcentration.value = true
  loadingCourses.value = true
  try {
    const [concentrations, courses] = await Promise.all([
      coursesService.konsentrasi(prodiId),
      coursesService.courselist(prodiId),
    ])
    concentrationOptions.value = concentrations.map((c) => ({ label: c, value: c }))
    courseOptions.value = courses
      .filter((c) => c.id !== modelValue.value.id)
      .map((c) => ({ label: c.name, value: c.id! }))
  } finally {
    loadingConcentration.value = false
    loadingCourses.value = false
  }
}

watch(
  () => modelValue.value.prodi_id,
  (prodiId) => {
    concentrationOptions.value = []
    courseOptions.value = []
    if (prodiId) loadDependent(prodiId)
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Kode</label>
        <InputText v-model="modelValue.code" class="w-full" :invalid="!!errors?.code" />
        <Message v-if="errors?.code" severity="error" size="small" variant="simple">{{
          errors.code
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Nama</label>
        <InputText v-model="modelValue.name" class="w-full" :invalid="!!errors?.name" />
        <Message v-if="errors?.name" severity="error" size="small" variant="simple">{{
          errors.name
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Program Studi</label>
        <Select
          v-model="modelValue.prodi_id"
          :options="prodiOptions"
          option-label="label"
          option-value="value"
          filter
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Tipe</label>
        <Select
          v-model="modelValue.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Semester</label>
        <Select
          v-model="modelValue.semester"
          :options="semesterOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Konsentrasi</label>
        <Select
          v-model="modelValue.concentration"
          :options="concentrationOptions"
          option-label="label"
          option-value="value"
          :loading="loadingConcentration"
          :disabled="!modelValue.prodi_id"
          show-clear
          class="w-full"
        />
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Semester Bentrok</h3>
      <SemesterConflictList v-model="modelValue.prohibited_semesters" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Matakuliah Bentrok</h3>
      <CourseConflictList
        v-model="modelValue.prohibited_course_ids"
        :options="courseOptions"
        :loading="loadingCourses"
      />
    </div>
  </div>
</template>
