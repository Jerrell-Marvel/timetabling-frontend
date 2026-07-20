<script setup lang="ts">
import type { Jenjang, JurusanPayload, Konsentrasi } from '@/types'

defineProps<{
  errors?: Record<string, string>
  /**
   * Existing concentrations, shown read-only on edit. `JurusanRequest` carries
   * no concentrations and the backend exposes no Konsentrasi write endpoint,
   * so these cannot be added/edited here (the old Prodi form's editable list
   * was writing to an endpoint that does not exist).
   */
  konsentrasi?: Konsentrasi[]
  isEdit?: boolean
}>()

const modelValue = defineModel<JurusanPayload>({ required: true })

const jenjangOptions: { label: string; value: Jenjang }[] = [
  { label: 'D3', value: 'D3' },
  { label: 'S1', value: 'S1' },
  { label: 'S2', value: 'S2' },
  { label: 'S3', value: 'S3' },
]
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Nama</label>
        <InputText v-model="modelValue.name" class="w-full" :invalid="!!errors?.name" />
        <Message v-if="errors?.name" severity="error" size="small" variant="simple">{{
          errors.name
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Fakultas</label>
        <InputText v-model="modelValue.faculty" class="w-full" :invalid="!!errors?.faculty" />
        <Message v-if="errors?.faculty" severity="error" size="small" variant="simple">{{
          errors.faculty
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Jenjang</label>
        <Select
          v-model="modelValue.jenjang"
          :options="jenjangOptions"
          option-label="label"
          option-value="value"
          placeholder="Pilih Jenjang"
          class="w-full"
          :invalid="!!errors?.jenjang"
        />
        <Message v-if="errors?.jenjang" severity="error" size="small" variant="simple">{{
          errors.jenjang
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Warna</label>
        <InputNumber v-model="modelValue.color" class="w-full" :min="0" show-buttons />
        <small class="text-surface-400">Indeks warna (angka), sesuai kolom `color`.</small>
      </div>
    </div>

    <div v-if="isEdit">
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Konsentrasi</h3>
      <ul v-if="konsentrasi?.length" class="flex flex-col gap-1">
        <li v-for="k in konsentrasi" :key="k.id" class="text-sm text-surface-700">
          {{ k.konsentrasi }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-400">Tidak ada data.</p>
      <small class="text-surface-400">Hanya baca — belum ada endpoint untuk mengubah konsentrasi.</small>
    </div>
  </div>
</template>
