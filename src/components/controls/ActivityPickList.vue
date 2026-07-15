<script setup lang="ts">
/**
 * Replaces `MultiListComponent`. A searchable dual-list over caller-supplied
 * `options`; emits the selected (target-side) ids via `v-model`. Search only
 * filters what's displayed — items hidden by the query but already selected
 * stay selected.
 */
import { computed, ref } from 'vue'
import type { Option, Id } from '@/types'

const props = defineProps<{
  modelValue: Id[]
  options: Option[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: Id[]] }>()

const query = ref('')

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.options.filter((o) => o.label.toLowerCase().includes(q)) : props.options
})

const lists = computed<Option[][]>({
  get: () => {
    const selected = new Set(props.modelValue)
    return [
      filteredOptions.value.filter((o) => !selected.has(o.value)),
      filteredOptions.value.filter((o) => selected.has(o.value)),
    ]
  },
  set: (value) => {
    const target = value[1] ?? []
    const targetIds = target.map((o) => o.value)
    const hiddenSelected = props.modelValue.filter(
      (id) => !filteredOptions.value.some((o) => o.value === id),
    )
    emit('update:modelValue', [...hiddenSelected, ...targetIds])
  },
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <InputText v-model="query" placeholder="Cari aktivitas..." class="w-full" />
    <PickList v-model="lists" data-key="value">
      <template #option="{ option }">
        <span>{{ option.label }}</span>
      </template>
    </PickList>
  </div>
</template>
