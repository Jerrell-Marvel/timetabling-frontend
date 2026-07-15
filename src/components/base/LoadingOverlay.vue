<script setup lang="ts">
// Replaces the legacy jQuery show/hide `LoaderComponent`. Driven purely by the
// `active` prop — callers wire it to a request/action `loading` ref, not DOM state.
withDefaults(
  defineProps<{
    active: boolean
    label?: string
  }>(),
  {
    label: 'MENUNGGU…',
  },
)
</script>

<template>
  <BlockUI :blocked="active" full-screen />
  <Teleport to="body">
    <div
      v-if="active"
      class="fixed inset-0 z-[1101] flex items-center justify-center pointer-events-none"
    >
      <div class="bg-white rounded-xl px-8 py-6 flex flex-col items-center gap-3 shadow-lg">
        <ProgressSpinner style="width: 3rem; height: 3rem" stroke-width="4" />
        <span class="text-sm font-semibold text-surface-700 tracking-wide">{{ label }}</span>
      </div>
    </div>
  </Teleport>
</template>
