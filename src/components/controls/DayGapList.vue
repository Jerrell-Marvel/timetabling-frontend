<script setup lang="ts">
/**
 * Minimum-days-between-activities rows. Replaces the legacy
 * `MultipleDaySlotComponent`; used by the Activity form.
 *
 * A gap is a `GAP` constraint whose `value` is the other activity's id and whose
 * `minGap` is the day count — so unlike the other constraint lists this one
 * needs a third field, which is why it isn't just a `ConstraintList`.
 */
import RepeatableRows from './RepeatableRows.vue'
import type { GapChoice, Option } from '@/types'

const props = defineProps<{
  modelValue: GapChoice[]
  /** Other activities (excluding self), with **string** values. */
  activityOptions: Option<string>[]
  /** Shown under the list to explain what "Soft Constraint" costs. */
  hint?: string
}>()

defineEmits<{ 'update:modelValue': [value: GapChoice[]] }>()

/** New rows default to hard — legacy behaviour, where every constraint was binding. */
function newRow(): GapChoice {
  return { value: '', isHard: true, minGap: 1 }
}

/** Grey out activities already picked; the backend rejects duplicates with a 400. */
function isTaken(option: Option<string>, row: GapChoice): boolean {
  return option.value !== row.value && props.modelValue.some((r) => r.value === option.value)
}
</script>

<template>
  <div>
    <RepeatableRows
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :new-row="newRow"
      add-label="Tambah Jarak Hari"
      :disable-add="activityOptions.length === 0"
    >
      <template #row="{ row }">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select
            v-model="row.value"
            :options="activityOptions"
            option-label="label"
            option-value="value"
            :option-disabled="(o: Option<string>) => isTaken(o, row)"
            filter
            placeholder="Aktivitas"
            class="w-full"
          />
          <InputNumber v-model="row.minGap" :min="1" placeholder="Jarak (hari)" class="w-full" />
          <SelectButton
            v-model="row.isHard"
            :options="[
              { label: 'Hard Constraint', value: true },
              { label: 'Soft Constraint', value: false },
            ]"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            size="small"
          />
        </div>
      </template>
    </RepeatableRows>

    <p v-if="hint" class="text-xs text-surface-400 mt-1">{{ hint }}</p>
  </div>
</template>
