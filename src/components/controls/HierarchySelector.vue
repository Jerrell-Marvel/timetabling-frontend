<script setup lang="ts">
/**
 * Replaces `TreeViewComponent` + `TreeNodeComponent`. A cascading checkbox tree
 * over caller-supplied `options` (e.g. prodi → concentration); emits the flat
 * array of checked node keys via `v-model`.
 */
import { computed } from 'vue'
import type { TreeSelectionKeys } from 'primevue/tree'
import type { TreeNode } from 'primevue/treenode'

const props = defineProps<{
  modelValue: string[]
  options: TreeNode[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const selectionKeys = computed<TreeSelectionKeys>({
  get: () =>
    Object.fromEntries(
      props.modelValue.map((key) => [key, { checked: true, partialChecked: false }]),
    ),
  set: (value) => {
    const checked = Object.entries(value ?? {})
      .filter(([, state]) => state.checked)
      .map(([key]) => key)
    emit('update:modelValue', checked)
  },
})
</script>

<template>
  <Tree
    :value="options"
    v-model:selection-keys="selectionKeys"
    selection-mode="checkbox"
    class="w-full"
  />
</template>
