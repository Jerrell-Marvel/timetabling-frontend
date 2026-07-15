<script setup lang="ts" generic="V extends string | number">
/** Replaces `MultipleCheckComponent` + `CustomCheckComponent`. A checkbox group with a "select all" header. */
import { computed } from 'vue'
import type { Option } from '@/types'

const props = defineProps<{
  modelValue: V[]
  options: Option<V>[]
  selectAllLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: V[]] }>()

const allSelected = computed(
  () => props.options.length > 0 && props.modelValue.length === props.options.length,
)
const someSelected = computed(() => props.modelValue.length > 0 && !allSelected.value)

function toggleAll(checked: boolean) {
  emit('update:modelValue', checked ? props.options.map((o) => o.value) : [])
}

function toggleOne(value: V, checked: boolean) {
  emit(
    'update:modelValue',
    checked ? [...props.modelValue, value] : props.modelValue.filter((v) => v !== value),
  )
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      class="flex items-center gap-2 text-sm font-medium text-surface-700 pb-2 border-b border-surface-100"
    >
      <Checkbox
        :model-value="allSelected"
        :indeterminate="someSelected"
        binary
        @update:model-value="toggleAll"
      />
      {{ selectAllLabel ?? 'Pilih Semua' }}
    </label>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex items-center gap-2 text-sm text-surface-700"
      >
        <Checkbox
          :model-value="modelValue.includes(option.value)"
          binary
          @update:model-value="(checked) => toggleOne(option.value, checked)"
        />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>
