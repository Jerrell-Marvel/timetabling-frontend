<script setup lang="ts">
/**
 * Fields mirror `CourseRequest` exactly: code, name, type, tingkat, konsentrasi,
 * jurusanId, plus the two conflict sets.
 *
 * Selecting a Jurusan reloads both dependent lists from that jurusan:
 * the concentration options (`GET /api/jurusans/{id}/konsentrasi`) and the
 * candidate conflict courses (`GET /api/courses/by-jurusan/{id}`).
 *
 * The concentration is validated server-side against the jurusan's list, so the
 * dropdown is a convenience, not the only guard — but a jurusan that defines no
 * concentrations accepts anything (legacy escape hatch), hence the empty state.
 */
import { computed, ref, watch } from 'vue'
import { coursesService, jurusansService } from '@/services'
import type { CoursePayload, CourseType, Id, Jurusan, Option } from '@/types'
import SemesterConflictList from '@/components/controls/SemesterConflictList.vue'
import CourseConflictList from '@/components/controls/CourseConflictList.vue'

const props = defineProps<{
  errors?: Record<string, string>
  jurusans: Jurusan[]
  /** Id of the course being edited, so it cannot be listed as its own conflict. */
  currentCourseId?: Id | null
}>()

const modelValue = defineModel<CoursePayload>({ required: true })

const typeOptions: { label: string; value: CourseType }[] = [
  { label: 'Wajib', value: 'Wajib' },
  { label: 'Pilihan', value: 'Pilihan' },
]
const tingkatOptions = Array.from({ length: 8 }, (_, i) => ({
  label: `Tingkat ${i + 1}`,
  value: i + 1,
}))

const konsentrasiOptions = ref<Option<string>[]>([])
const loadingKonsentrasi = ref(false)

const courseOptions = ref<Option<Id>[]>([])
const loadingCourses = ref(false)

/** `courseConstraints` is optional on the payload; the pickers need a concrete array. */
const courseConstraints = computed<Id[]>({
  get: () => modelValue.value.courseConstraints ?? [],
  set: (value) => {
    modelValue.value.courseConstraints = value
  },
})
const semesterConstraints = computed<number[]>({
  get: () => modelValue.value.semesterConstraints ?? [],
  set: (value) => {
    modelValue.value.semesterConstraints = value
  },
})

async function loadKonsentrasi(jurusanId: number) {
  loadingKonsentrasi.value = true
  try {
    const list = await jurusansService.konsentrasi(jurusanId)
    konsentrasiOptions.value = list.map((k) => ({ label: k.konsentrasi, value: k.konsentrasi }))
  } finally {
    loadingKonsentrasi.value = false
  }
}

async function loadCourses(jurusanId: number) {
  loadingCourses.value = true
  try {
    const list = await coursesService.byJurusan(jurusanId)
    courseOptions.value = list
      .filter((c) => c.id !== undefined && c.id !== props.currentCourseId)
      .map((c) => ({ label: `${c.code} — ${c.name}`, value: c.id! }))
  } finally {
    loadingCourses.value = false
  }
}

watch(
  () => modelValue.value.jurusanId,
  (jurusanId) => {
    konsentrasiOptions.value = []
    courseOptions.value = []
    if (jurusanId) {
      loadKonsentrasi(jurusanId)
      loadCourses(jurusanId)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1"
          >Kode<span class="text-red-500 ml-1">*</span></label
        >
        <InputText v-model="modelValue.code" class="w-full" :invalid="!!errors?.code" />
        <Message v-if="errors?.code" severity="error" size="small" variant="simple">{{
          errors.code
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1"
          >Nama<span class="text-red-500 ml-1">*</span></label
        >
        <InputText v-model="modelValue.name" class="w-full" :invalid="!!errors?.name" />
        <Message v-if="errors?.name" severity="error" size="small" variant="simple">{{
          errors.name
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1"
          >Jurusan<span class="text-red-500 ml-1">*</span></label
        >
        <Select
          v-model="modelValue.jurusanId"
          :options="props.jurusans"
          option-label="name"
          option-value="id"
          filter
          placeholder="Pilih Jurusan"
          class="w-full"
          :invalid="!!errors?.jurusanId"
        />
        <Message v-if="errors?.jurusanId" severity="error" size="small" variant="simple">{{
          errors.jurusanId
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1"
          >Tipe<span class="text-red-500 ml-1">*</span></label
        >
        <Select
          v-model="modelValue.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :invalid="!!errors?.type"
        />
        <Message v-if="errors?.type" severity="error" size="small" variant="simple">{{
          errors.type
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Tingkat</label>
        <Select
          v-model="modelValue.tingkat"
          :options="tingkatOptions"
          option-label="label"
          option-value="value"
          show-clear
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Konsentrasi</label>
        <Select
          v-model="modelValue.konsentrasi"
          :options="konsentrasiOptions"
          option-label="label"
          option-value="value"
          :loading="loadingKonsentrasi"
          :disabled="!modelValue.jurusanId"
          show-clear
          class="w-full"
          :invalid="!!errors?.konsentrasi"
        />
        <Message v-if="errors?.konsentrasi" severity="error" size="small" variant="simple">{{
          errors.konsentrasi
        }}</Message>
        <small
          v-else-if="modelValue.jurusanId && !konsentrasiOptions.length"
          class="text-surface-400"
        >
          Jurusan ini belum memiliki konsentrasi.
        </small>
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Semester Bentrok</h3>
      <SemesterConflictList v-model="semesterConstraints" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Matakuliah Bentrok</h3>
      <CourseConflictList
        v-model="courseConstraints"
        :options="courseOptions"
        :loading="loadingCourses"
      />
      <small v-if="!modelValue.jurusanId" class="text-surface-400">
        Pilih jurusan terlebih dahulu.
      </small>
    </div>
  </div>
</template>
