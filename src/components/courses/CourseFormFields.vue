<script setup lang="ts">
/**
 * Fields mirror `CourseRequest` exactly: code, name, type, tingkat, konsentrasi,
 * jurusanId.
 *
 * Selecting a Jurusan reloads the concentration options from
 * `GET /api/jurusans/{id}/konsentrasi`.
 *
 * NOTE: the legacy "Semester Bentrok" / "Matakuliah Bentrok" pickers were
 * removed — `CourseRequest` accepts no such fields, so anything chosen there was
 * silently discarded on save. They belong to `course_constraints`, which this
 * backend does not yet expose.
 */
import { ref, watch } from 'vue'
import { jurusansService } from '@/services'
import type { CoursePayload, CourseType, Jurusan, Option } from '@/types'

const props = defineProps<{
  errors?: Record<string, string>
  jurusans: Jurusan[]
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

async function loadKonsentrasi(jurusanId: number) {
  loadingKonsentrasi.value = true
  try {
    const list = await jurusansService.konsentrasi(jurusanId)
    konsentrasiOptions.value = list.map((k) => ({ label: k.konsentrasi, value: k.konsentrasi }))
  } finally {
    loadingKonsentrasi.value = false
  }
}

watch(
  () => modelValue.value.jurusanId,
  (jurusanId) => {
    konsentrasiOptions.value = []
    if (jurusanId) loadKonsentrasi(jurusanId)
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
        <label class="block text-sm font-medium text-surface-700 mb-1">Jurusan</label>
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
        <label class="block text-sm font-medium text-surface-700 mb-1">Tipe</label>
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
        />
      </div>
    </div>
  </div>
</template>
