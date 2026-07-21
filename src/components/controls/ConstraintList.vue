<script setup lang="ts">
/**
 * A list of constraint picks, each with its own hard/soft choice — the control
 * behind the Ruangan / Tipe Ruangan / Paralel sections of the Activity form.
 *
 * Replaces the plain `MultiSelect` those sections used: a multiselect has
 * nowhere to hang a per-item flag, and the legacy Blade form was row-based with
 * an add button anyway, so this is a return to the original UX rather than a
 * new one.
 *
 * `options` must carry **string** values, matching `ConstraintChoice.value` —
 * the backend stores every constraint value as a string, and a number/string
 * mismatch would silently break `Select`'s equality check.
 */
import RepeatableRows from './RepeatableRows.vue'
import type { ConstraintChoice, Option } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue: ConstraintChoice[]
    options: Option<string>[]
    addLabel?: string
    placeholder?: string
    /** Shown under the list to explain what "Soft Constraint" costs. */
    hint?: string
  }>(),
  { addLabel: 'Tambah Baris', placeholder: 'Pilih' },
)

defineEmits<{ 'update:modelValue': [value: ConstraintChoice[]] }>()

/** New rows default to hard — legacy behaviour, where every constraint was binding. */
function newRow(): ConstraintChoice {
  return { value: '', isHard: true }
}

/** Grey out values already picked; the backend rejects duplicates with a 400. */
function isTaken(option: Option<string>, row: ConstraintChoice): boolean {
  return option.value !== row.value && props.modelValue.some((r) => r.value === option.value)
}
</script>

<template>
  <div>
    <RepeatableRows
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :new-row="newRow"
      :add-label="addLabel"
      :disable-add="options.length === 0"
    >
      <template #row="{ row }">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select
            v-model="row.value"
            :options="options"
            option-label="label"
            option-value="value"
            :option-disabled="(o: Option<string>) => isTaken(o, row)"
            :placeholder="placeholder"
            filter
            class="w-full"
          />
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
