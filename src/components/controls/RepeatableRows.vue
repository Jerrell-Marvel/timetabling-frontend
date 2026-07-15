<script setup lang="ts" generic="T">
/**
 * Generic add/remove/reorder host for repeatable form rows — the base the five
 * legacy `Multiple*Component`s (time slots, day gaps, course/semester conflicts,
 * concentrations) are built on. Structural changes (add/remove/reorder) emit a
 * new array; field-level edits inside `#row` are the caller's responsibility
 * (object rows may mutate in place via deep reactivity, primitive rows must
 * emit an updated array — see the sibling `*List.vue` controls for both).
 */
const props = withDefaults(
  defineProps<{
    modelValue: T[]
    newRow: () => T
    addLabel?: string
    disableAdd?: boolean
  }>(),
  { addLabel: 'Tambah Baris' },
)

const emit = defineEmits<{ 'update:modelValue': [value: T[]] }>()

defineSlots<{
  row(props: { row: T; index: number }): unknown
}>()

function addRow() {
  emit('update:modelValue', [...props.modelValue, props.newRow()])
}

function removeRow(index: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}

function moveUp(index: number) {
  if (index === 0) return
  const next = [...props.modelValue]
  const prev = next[index - 1]!
  next[index - 1] = next[index]!
  next[index] = prev
  emit('update:modelValue', next)
}

function moveDown(index: number) {
  if (index === props.modelValue.length - 1) return
  const next = [...props.modelValue]
  const cur = next[index]!
  next[index] = next[index + 1]!
  next[index + 1] = cur
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(row, index) in modelValue"
      :key="index"
      class="flex items-start gap-2 p-3 bg-surface-50 rounded-lg border border-surface-100"
    >
      <div class="flex-1">
        <slot name="row" :row="row" :index="index" />
      </div>
      <div class="flex flex-col gap-1">
        <Button
          icon="pi pi-arrow-up"
          text
          rounded
          size="small"
          severity="secondary"
          :disabled="index === 0"
          @click="moveUp(index)"
        />
        <Button
          icon="pi pi-arrow-down"
          text
          rounded
          size="small"
          severity="secondary"
          :disabled="index === modelValue.length - 1"
          @click="moveDown(index)"
        />
        <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeRow(index)" />
      </div>
    </div>

    <Button
      :label="addLabel"
      icon="pi pi-plus"
      text
      size="small"
      class="self-start"
      :disabled="disableAdd"
      @click="addRow"
    />
  </div>
</template>
