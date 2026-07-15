<script setup lang="ts">
import ConcentrationList from '@/components/controls/ConcentrationList.vue'
import type { Prodi } from '@/types'

defineProps<{
  errors?: Record<string, string>
}>()

const modelValue = defineModel<Prodi>({ required: true })
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
        <InputText v-model="modelValue.faculty" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Jenjang</label>
        <InputText v-model="modelValue.degree" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Warna</label>
        <ColorPicker v-model="modelValue.color" />
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Konsentrasi</h3>
      <ConcentrationList v-model="modelValue.concentrations" />
    </div>
  </div>
</template>
