<script setup lang="ts">
/**
 * Replaces `TreeViewComponent` + `TreeNodeComponent` and the server-side tree
 * builders in Laravel's `SettingController` (`createRoomTree` /
 * `createJurusanTree`). A cascading checkbox tree over caller-supplied `options`;
 * `v-model` is the flat array of checked **leaf** keys.
 *
 * Two rules carried over verbatim from the legacy PHP:
 *
 * 1. **Strict roll-up.** A group node is checked only when EVERY descendant leaf
 *    is checked — `$isChecked`/`$isChecked2`/`$isChecked3`/`$isChecked4`, each of
 *    which starts `true` and is flipped to `false` by a single unchecked child.
 *    Anything in between renders as indeterminate, never as checked.
 * 2. **Group nodes are structural only.** Legacy gave them synthetic negative ids
 *    (`-1`, `-2`, …) precisely so they could never be mistaken for a real record.
 *    Here they are simply excluded from the model, so a parent key never leaks
 *    into `setting_constraints`.
 *
 * PrimeVue's `Tree` propagates a click down to descendants and up to ancestors on
 * its own; what it will not do is derive the initial parent state from a set of
 * leaf keys, which is what the `get` below computes.
 */
import { computed } from 'vue'
import type { TreeSelectionKeys } from 'primevue/tree'
import type { TreeNode } from 'primevue/treenode'

const props = defineProps<{
  modelValue: string[]
  options: TreeNode[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

function isLeaf(node: TreeNode): boolean {
  return !node.children || node.children.length === 0
}

/** Every leaf key in the tree, in render order. */
function leafKeys(nodes: TreeNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (isLeaf(node)) {
      if (node.key !== undefined) out.push(String(node.key))
    } else {
      leafKeys(node.children!, out)
    }
  }
  return out
}

const selectionKeys = computed<TreeSelectionKeys>({
  get: () => {
    const selected = new Set(props.modelValue)
    const keys: TreeSelectionKeys = {}

    /** Returns [checkedLeaves, totalLeaves] for the subtree rooted at `node`. */
    function visit(node: TreeNode): [number, number] {
      const key = node.key !== undefined ? String(node.key) : undefined

      if (isLeaf(node)) {
        const checked = key !== undefined && selected.has(key)
        if (checked && key !== undefined) keys[key] = { checked: true, partialChecked: false }
        return [checked ? 1 : 0, 1]
      }

      let checkedLeaves = 0
      let totalLeaves = 0
      for (const child of node.children!) {
        const [c, t] = visit(child)
        checkedLeaves += c
        totalLeaves += t
      }

      if (key !== undefined && totalLeaves > 0) {
        // Strict: checked only when nothing below is unchecked.
        if (checkedLeaves === totalLeaves) {
          keys[key] = { checked: true, partialChecked: false }
        } else if (checkedLeaves > 0) {
          keys[key] = { checked: false, partialChecked: true }
        }
      }
      return [checkedLeaves, totalLeaves]
    }

    for (const node of props.options) visit(node)
    return keys
  },

  set: (value) => {
    const state = value ?? {}
    // Keep only leaves, and keep the tree's own ordering rather than the order
    // PrimeVue happened to write the keys in.
    emit(
      'update:modelValue',
      leafKeys(props.options).filter((key) => state[key]?.checked === true),
    )
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
