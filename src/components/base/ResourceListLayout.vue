<script setup lang="ts">
/**
 * Replaces legacy `IndexPageComponent` (and `KeyValueIndexComponent` — that's
 * just this layout wrapping a `ResourceTable` with a single-column config, no
 * separate component needed). Hosts the page title, an optional "create" link,
 * and an `#actions` slot for import/export controls; the default slot holds the
 * table/content.
 */
withDefaults(
  defineProps<{
    title: string
    createTo?: string
    createLabel?: string
  }>(),
  {
    createLabel: 'Tambah',
  },
)
</script>

<template>
  <Card>
    <template #title>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <span>{{ title }}</span>
        <div class="flex items-center gap-2">
          <slot name="actions" />
          <RouterLink v-if="createTo" :to="createTo">
            <Button :label="createLabel" icon="pi pi-plus" />
          </RouterLink>
        </div>
      </div>
    </template>
    <template #content>
      <slot />
    </template>
  </Card>
</template>
