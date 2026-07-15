<script setup lang="ts" generic="T extends object">
/**
 * Config-driven table replacing legacy `TableComponent` (jQuery DataTables) —
 * no domain knowledge lives here. Column/action config is passed in per domain.
 * Deletion never uses an HTML form; it routes through `useConfirm` (the same
 * global `ConfirmDialog` instance `ConfirmActionDialog` uses) before emitting.
 */
import { useConfirm } from '@/composables/useConfirm'

export interface ResourceColumn {
  /** Supports dot-notation nested-field access, e.g. `"course.name"`. */
  field: string
  header: string
  sortable?: boolean
}

export type ResourceAction = 'view' | 'edit' | 'delete'

const props = withDefaults(
  defineProps<{
    rows: T[]
    columns: ResourceColumn[]
    actions?: ResourceAction[]
    loading?: boolean
    pageSize?: number
    dataKey?: string
    deleteMessage?: string
  }>(),
  {
    actions: () => ['view', 'edit', 'delete'],
    loading: false,
    pageSize: 10,
    dataKey: 'id',
    deleteMessage: 'Yakin ingin menghapus data ini?',
  },
)

const emit = defineEmits<{
  view: [row: T]
  edit: [row: T]
  delete: [row: T]
}>()

const confirm = useConfirm()

function resolveField(row: T, field: string): unknown {
  return field.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') return (value as Record<string, unknown>)[key]
    return undefined
  }, row)
}

function onDeleteClick(row: T) {
  confirm.requireDelete(() => emit('delete', row), props.deleteMessage)
}
</script>

<template>
  <DataTable
    :value="rows"
    :loading="loading"
    :paginator="rows.length > pageSize"
    :rows="pageSize"
    :data-key="dataKey"
    striped-rows
    responsive-layout="scroll"
  >
    <Column
      v-for="column in columns"
      :key="column.field"
      :field="column.field"
      :header="column.header"
      :sortable="column.sortable"
    >
      <template #body="{ data }">
        {{ resolveField(data, column.field) }}
      </template>
    </Column>

    <Column v-if="actions.length" header="Aksi" :exportable="false" style="width: 1%">
      <template #body="{ data }">
        <div class="flex items-center gap-1 whitespace-nowrap">
          <Button
            v-if="actions.includes('view')"
            icon="pi pi-eye"
            text
            rounded
            severity="secondary"
            @click="emit('view', data)"
          />
          <Button
            v-if="actions.includes('edit')"
            icon="pi pi-pencil"
            text
            rounded
            severity="info"
            @click="emit('edit', data)"
          />
          <Button
            v-if="actions.includes('delete')"
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            @click="onDeleteClick(data)"
          />
        </div>
      </template>
    </Column>

    <template #empty> Tidak ada data. </template>
  </DataTable>
</template>
