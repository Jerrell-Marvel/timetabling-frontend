<script setup lang="ts">
/** Replaces `MultipleDaySlotComponent`. Used by the Activity form. */
import RepeatableRows from './RepeatableRows.vue'
import type { DayGap, Option } from '@/types'

const props = defineProps<{
  modelValue: DayGap[]
  activityOptions: Option[]
}>()
defineEmits<{ 'update:modelValue': [value: DayGap[]] }>()

function newRow(): DayGap {
  return { activity_id: props.activityOptions[0]?.value ?? 0, min_gap_day: 1 }
}
</script>

<template>
  <RepeatableRows
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :new-row="newRow"
    add-label="Tambah Jarak Hari"
    :disable-add="activityOptions.length === 0"
  >
    <template #row="{ row }">
      <div class="grid grid-cols-2 gap-2">
        <Select
          v-model="row.activity_id"
          :options="activityOptions"
          option-label="label"
          option-value="value"
          filter
          placeholder="Aktivitas"
        />
        <InputNumber v-model="row.min_gap_day" :min="0" placeholder="Jarak (hari)" />
      </div>
    </template>
  </RepeatableRows>
</template>
