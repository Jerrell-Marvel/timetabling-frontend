<script setup lang="ts">
/** Password is optional on edit — an empty field means "keep the current password". */
import type { UserPayload } from '@/types'

defineProps<{
  errors?: Record<string, string>
  isEdit?: boolean
}>()

const modelValue = defineModel<UserPayload>({ required: true })
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-surface-700 mb-1">Nama</label>
      <InputText v-model="modelValue.name" class="w-full" :invalid="!!errors?.name" />
      <Message v-if="errors?.name" severity="error" size="small" variant="simple">{{
        errors.name
      }}</Message>
    </div>
    <div>
      <label class="block text-sm font-medium text-surface-700 mb-1">Email</label>
      <InputText
        v-model="modelValue.email"
        type="email"
        class="w-full"
        :invalid="!!errors?.email"
      />
      <Message v-if="errors?.email" severity="error" size="small" variant="simple">{{
        errors.email
      }}</Message>
    </div>
    <div>
      <label class="block text-sm font-medium text-surface-700 mb-1">
        Password{{ isEdit ? ' (kosongkan jika tidak diubah)' : '' }}
      </label>
      <Password
        v-model="modelValue.password"
        :feedback="false"
        toggle-mask
        class="w-full"
        input-class="w-full"
        :invalid="!!errors?.password"
      />
      <Message v-if="errors?.password" severity="error" size="small" variant="simple">{{
        errors.password
      }}</Message>
    </div>
    <div>
      <label class="block text-sm font-medium text-surface-700 mb-1">Fakultas</label>
      <InputText v-model="modelValue.faculty" class="w-full" />
    </div>
  </div>
</template>
