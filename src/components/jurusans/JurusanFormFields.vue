<script setup lang="ts">
import type { Jenjang, JurusanPayload, KonsentrasiDraft } from '@/types'
import RepeatableRows from '@/components/controls/RepeatableRows.vue'

defineProps<{ errors?: Record<string, string> }>()

const modelValue = defineModel<JurusanPayload>({ required: true })

/**
 * Concentrations, edited as their own list and reconciled by
 * `konsentrasiService.reconcile` on save (they are NOT part of `JurusanRequest`).
 */
const konsentrasi = defineModel<KonsentrasiDraft[]>('konsentrasi', { required: true })

const jenjangOptions: { label: string; value: Jenjang }[] = [
  { label: 'D3', value: 'D3' },
  { label: 'S1', value: 'S1' },
  { label: 'S2', value: 'S2' },
  { label: 'S3', value: 'S3' },
]

function newKonsentrasi(): KonsentrasiDraft {
  return { konsentrasi: '' }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <label class="block text-sm font-medium text-surface-700 mb-1">Fakultas</label>
        <InputText v-model="modelValue.faculty" class="w-full" :invalid="!!errors?.faculty" />
        <Message v-if="errors?.faculty" severity="error" size="small" variant="simple">{{
          errors.faculty
        }}</Message>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1"
          >Jenjang<span class="text-red-500 ml-1">*</span></label
        >
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

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Konsentrasi</h3>
      <RepeatableRows
        v-model="konsentrasi"
        :new-row="newKonsentrasi"
        add-label="Tambah Konsentrasi"
      >
        <template #row="{ row }">
          <InputText v-model="row.konsentrasi" class="w-full" placeholder="Nama konsentrasi" />
        </template>
      </RepeatableRows>
      <small class="text-surface-400">
        Konsentrasi yang sudah dipakai mata kuliah tidak dapat dihapus atau diganti namanya.
      </small>
    </div>
  </div>
</template>
