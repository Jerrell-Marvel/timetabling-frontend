<script setup lang="ts">
/**
 * Replaces `MultipleCoursesComponent`. Prohibited-course rows on the Course
 * form; `options` reloads (with `loading`) when the driving program changes —
 * that watcher lives in `CourseFormFields`, not here. Rows are plain IDs, so
 * edits emit a new array rather than mutating in place.
 */
import RepeatableRows from './RepeatableRows.vue'
import type { Option } from '@/types'

const props = defineProps<{
  modelValue: number[]
  options: Option[]
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

function newRow(): number {
  return props.options[0]?.value ?? 0
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
    add-label="Tambah Matakuliah Bentrok"
    :disable-add="loading || options.length === 0"
  >
    <template #row="{ row, index }">
      <Select
        :model-value="row"
        @update:model-value="updateRow(index, $event)"
        :options="options"
        option-label="label"
        option-value="value"
        :loading="loading"
        filter
        placeholder="Pilih matakuliah"
        class="w-full"
      />
    </template>
  </RepeatableRows>
</template>
