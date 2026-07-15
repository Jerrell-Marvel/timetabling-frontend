<script setup lang="ts">
/** Replaces `MultipleSemesterComponent`. Prohibited-semester rows (1-8) on the Course form. */
import RepeatableRows from './RepeatableRows.vue'

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
  label: `Semester ${i + 1}`,
  value: i + 1,
}))

function newRow(): number {
  return semesterOptions[0]!.value
}

function updateRow(index: number, value: number) {
  const next = [...props.modelValue]
  next[index] = value
  emit('update:modelValue', next)
}
</script>

<template>
  <RepeatableRows
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :new-row="newRow"
    add-label="Tambah Semester Bentrok"
  >
    <template #row="{ row, index }">
      <Select
        :model-value="row"
        @update:model-value="updateRow(index, $event)"
        :options="semesterOptions"
        option-label="label"
        option-value="value"
        placeholder="Pilih semester"
        class="w-full"
      />
    </template>
  </RepeatableRows>
</template>
