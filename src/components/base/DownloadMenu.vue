<script setup lang="ts">
/**
 * Replaces legacy `DownloadComponent`. A split-button is preferred over a modal:
 * the primary action runs the first item (typically the data export), the
 * dropdown holds the rest (e.g. an Excel template download).
 */
import { computed } from 'vue'
import type { MenuItem } from 'primevue/menuitem'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/lib/api'

export interface DownloadItem {
  label: string
  icon?: string
  filename: string
  action: () => Promise<Blob>
}

const props = defineProps<{
  items: DownloadItem[]
  label?: string
}>()

const toast = useToast()

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function run(item: DownloadItem) {
  try {
    const blob = await item.action()
    saveBlob(blob, item.filename)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Gagal mengunduh file.'))
  }
}

const menuItems = computed<MenuItem[]>(() =>
  props.items.slice(1).map((item) => ({
    label: item.label,
    icon: item.icon ?? 'pi pi-download',
    command: () => run(item),
  })),
)
</script>

<template>
  <SplitButton
    v-if="items.length"
    :label="label ?? items[0]!.label"
    :icon="items[0]!.icon ?? 'pi pi-download'"
    :model="menuItems"
    severity="secondary"
    @click="run(items[0]!)"
  />
</template>
