<script setup lang="ts">
/**
 * Replaces the legacy results index actions. No form/detail — import updated
 * results, export SIAKAD, printable download, open snapshot, and delete are
 * the only operations.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ImportDialog, ConfirmActionDialog } from '@/components/base'
import type { ImportEndpoint } from '@/components/base'
import { resultsService } from '@/services'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/lib/api'
import type { Result } from '@/types'

const router = useRouter()
const toast = useToast()
const results = ref<Result[]>([])
const loading = ref(false)
const importVisible = ref(false)
const confirmDialog = ref<InstanceType<typeof ConfirmActionDialog> | null>(null)

const importEndpoints: ImportEndpoint[] = [
  { key: 'update', label: 'Update Hasil', upload: (file) => resultsService.uploadUpdate(file) },
]

async function load() {
  loading.value = true
  try {
    results.value = await resultsService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function exportSiakad(result: Result) {
  try {
    const blob = await resultsService.exportSiakad(result.id)
    saveBlob(blob, `siakad-${result.name}.xlsx`)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Gagal mengekspor ke SIAKAD.'))
  }
}

async function downloadPrint(result: Result) {
  try {
    const blob = await resultsService.downloadPrint(result.id)
    saveBlob(blob, `cetak-${result.name}.pdf`)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Gagal mengunduh dokumen cetak.'))
  }
}

function openSnapshot(result: Result) {
  router.push({ name: 'timetable.show', params: { id: String(result.id) } })
}

function deleteResult(result: Result) {
  confirmDialog.value?.confirm({
    message: `Hapus hasil "${result.name}"?`,
    header: 'Hapus Hasil',
    acceptSeverity: 'danger',
    acceptLabel: 'Hapus',
    accept: async () => {
      await resultsService.destroy(result.id)
      toast.success('Hasil berhasil dihapus.')
      await load()
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <Button
        label="Impor Update Hasil"
        icon="pi pi-upload"
        severity="secondary"
        @click="importVisible = true"
      />
    </div>

    <DataTable :value="results" :loading="loading" striped-rows>
      <Column field="name" header="Nama" />
      <Column header="Aksi" style="width: 1%">
        <template #body="{ data }">
          <div class="flex items-center gap-1 whitespace-nowrap">
            <Button
              icon="pi pi-eye"
              text
              rounded
              severity="secondary"
              @click="openSnapshot(data)"
            />
            <Button
              icon="pi pi-file-excel"
              text
              rounded
              severity="success"
              @click="exportSiakad(data)"
            />
            <Button icon="pi pi-print" text rounded severity="info" @click="downloadPrint(data)" />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="deleteResult(data)"
            />
          </div>
        </template>
      </Column>
      <template #empty> Tidak ada data. </template>
    </DataTable>

    <ImportDialog
      v-model:visible="importVisible"
      :endpoints="importEndpoints"
      header="Impor Update Hasil"
      @uploaded="load"
    />
    <ConfirmActionDialog ref="confirmDialog" />
  </div>
</template>
