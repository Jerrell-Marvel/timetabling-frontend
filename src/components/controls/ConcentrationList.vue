<script setup lang="ts">
/** Replaces `ConsentrationComponent`. Repeatable free-text rows on the Prodi form. */
import RepeatableRows from './RepeatableRows.vue'

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

function newRow(): string {
  return ''
}

function updateRow(index: number, value: string) {
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
    add-label="Tambah Konsentrasi"
  >
    <template #row="{ row, index }">
      <InputText
        :model-value="row"
        @update:model-value="updateRow(index, $event as string)"
        placeholder="Nama konsentrasi"
        class="w-full"
      />
    </template>
  </RepeatableRows>
</template>
