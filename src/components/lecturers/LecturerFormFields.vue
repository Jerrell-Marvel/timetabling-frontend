<script setup lang="ts">
import { computed } from 'vue'
import TimeRangeList from '@/components/controls/TimeRangeList.vue'
import type { Jurusan, Lecturer, LecturerTime } from '@/types'

defineProps<{
  errors?: Record<string, string>
  /** `homeBase` options, loaded from `/api/jurusans` by the parent view. */
  jurusans: Jurusan[]
}>()

const modelValue = defineModel<Lecturer>({ required: true })

// The backend already groups times by type, so these are straight passthroughs
// (no client-side filtering/merging needed).
const unavailableTimes = computed<LecturerTime[]>({
  get: () => modelValue.value.notAvailable ?? [],
  set: (value) => {
    modelValue.value.notAvailable = value
  },
})

const priorityTimes = computed<LecturerTime[]>({
  get: () => modelValue.value.priority ?? [],
  set: (value) => {
    modelValue.value.priority = value
  },
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1"
          >NIK<span class="text-red-500 ml-1">*</span></label
        >
        <InputText v-model="modelValue.nik" class="w-full" :invalid="!!errors?.nik" />
        <Message v-if="errors?.nik" severity="error" size="small" variant="simple">{{
          errors.nik
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
        <label class="block text-sm font-medium text-surface-700 mb-1">Alias</label>
        <InputText v-model="modelValue.alias" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1"
          >Home Base<span class="text-red-500 ml-1">*</span></label
        >
        <Select
          v-model="modelValue.homeBase"
          :options="jurusans"
          option-label="name"
          option-value="id"
          placeholder="Pilih Home Base"
          class="w-full"
          :invalid="!!errors?.homeBase"
        />
        <Message v-if="errors?.homeBase" severity="error" size="small" variant="simple">{{
          errors.homeBase
        }}</Message>
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Waktu Tidak Tersedia</h3>
      <TimeRangeList v-model="unavailableTimes" type="NOT_AVAILABLE" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Waktu Preferensi</h3>
      <TimeRangeList v-model="priorityTimes" type="PRIORITY" />
    </div>
  </div>
</template>
