<script setup lang="ts">
/**
 * Toolbar: generate / save / edit-toggle / setting-profile / history-snapshot.
 * Replaces `GenerateButtonComponent`, `SaveButtonComponent`,
 * `EditToggleButtonComponent`, `PengaturanButtonComponent`, `HistoryButtonComponent`.
 */
import { computed } from 'vue'
import type { Id, Setting } from '@/types'
import type { HistoryEntry } from '@/composables/useSchedule'

const props = defineProps<{
  disabled: boolean
  editDisabled: boolean
  editMode: boolean
  generating: boolean
  saving: boolean
  settings: Setting[]
  currentSettingId: Id | null
  historyOptions: HistoryEntry[]
  currentHistoryId: number | null
}>()
defineEmits<{
  generate: []
  save: []
  'toggle-edit': []
  'update:currentSettingId': [id: Id | null]
  'select-history': [id: number]
}>()

const settingOptions = computed(() => [
  { id: null as Id | null, name: 'None' },
  ...props.settings.map((s) => ({ id: s.id ?? null, name: s.name })),
])
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap justify-end">
    <Select
      :model-value="currentHistoryId"
      :options="historyOptions"
      option-label="label"
      option-value="id"
      placeholder="Hasil Terakhir"
      :disabled="disabled || !historyOptions.length"
      class="w-44"
      @update:model-value="$emit('select-history', $event)"
    />

    <Select
      :model-value="currentSettingId"
      :options="settingOptions"
      option-label="name"
      option-value="id"
      placeholder="Pengaturan"
      :disabled="disabled"
      class="w-44"
      @update:model-value="$emit('update:currentSettingId', $event)"
    />

    <Button
      label="Generate"
      icon="pi pi-bolt"
      severity="success"
      :loading="generating"
      :disabled="disabled"
      @click="$emit('generate')"
    />

    <Button
      :label="editMode ? 'Selesai' : 'Ubah Tabel'"
      :icon="editMode ? 'pi pi-check' : 'pi pi-pencil'"
      :severity="editMode ? 'danger' : 'success'"
      :disabled="editDisabled"
      @click="$emit('toggle-edit')"
    />

    <Button
      label="Simpan"
      icon="pi pi-save"
      severity="success"
      :loading="saving"
      :disabled="disabled"
      @click="$emit('save')"
    />
  </div>
</template>
