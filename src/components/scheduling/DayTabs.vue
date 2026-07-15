<script setup lang="ts">
/** Mon–Sat day selector. Replaces `DaysComponent`. */
const props = defineProps<{
  modelValue: number
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [day: number] }>()

const days = [
  { label: 'Senin', value: 1 },
  { label: 'Selasa', value: 2 },
  { label: 'Rabu', value: 3 },
  { label: 'Kamis', value: 4 },
  { label: 'Jumat', value: 5 },
  { label: 'Sabtu', value: 6 },
]

function select(day: number) {
  if (props.disabled || day === props.modelValue) return
  emit('update:modelValue', day)
}
</script>

<template>
  <SelectButton
    :model-value="modelValue"
    :options="days"
    option-label="label"
    option-value="value"
    :disabled="disabled"
    :allow-empty="false"
    @update:model-value="select"
  />
</template>
