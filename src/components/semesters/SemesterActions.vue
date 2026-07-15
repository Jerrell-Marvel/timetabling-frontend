<script setup lang="ts">
/**
 * Replaces the legacy semester index actions. No form/detail — every mutation
 * is a confirmed, blocking action routed through `ConfirmActionDialog`.
 */
import { onMounted, ref } from 'vue'
import { ConfirmActionDialog } from '@/components/base'
import { semestersService } from '@/services'
import type { Semester } from '@/types'

const semesters = ref<Semester[]>([])
const loading = ref(false)
const confirmDialog = ref<InstanceType<typeof ConfirmActionDialog> | null>(null)

async function load() {
  loading.value = true
  try {
    semesters.value = await semestersService.list()
  } finally {
    loading.value = false
  }
}
onMounted(load)

function addNext() {
  confirmDialog.value?.confirm({
    message: 'Tambah semester berikutnya?',
    header: 'Semester Berikutnya',
    withProgress: true,
    progressLabel: 'MENAMBAHKAN SEMESTER…',
    successMessage: 'Semester berikutnya berhasil ditambahkan.',
    accept: async () => {
      await semestersService.next()
      await load()
    },
  })
}

function markCurrent(semester: Semester) {
  confirmDialog.value?.confirm({
    message: `Jadikan "${semester.name}" sebagai semester aktif?`,
    header: 'Jadikan Aktif',
    withProgress: true,
    progressLabel: 'MEMPERBARUI SEMESTER AKTIF…',
    successMessage: 'Semester aktif berhasil diperbarui.',
    accept: async () => {
      await semestersService.setCurrent(semester.id!)
      await load()
    },
  })
}

function duplicateSemester(semester: Semester) {
  confirmDialog.value?.confirm({
    message: `Duplikat semester "${semester.name}"?`,
    header: 'Duplikat Semester',
    withProgress: true,
    progressLabel: 'MENDUPLIKASI SEMESTER…',
    successMessage: 'Semester berhasil diduplikasi.',
    accept: async () => {
      await semestersService.duplicate(semester.id!)
      await load()
    },
  })
}

function resetCurrent(semester: Semester) {
  confirmDialog.value?.confirm({
    message: `Reset status aktif semester "${semester.name}"?`,
    header: 'Reset Semester Aktif',
    acceptSeverity: 'danger',
    acceptLabel: 'Reset',
    withProgress: true,
    progressLabel: 'MERESET SEMESTER AKTIF…',
    successMessage: 'Status semester aktif berhasil direset.',
    accept: async () => {
      await semestersService.remove(semester.id!)
      await load()
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <Button label="Tambah Semester Berikutnya" icon="pi pi-plus" @click="addNext" />
    </div>

    <DataTable :value="semesters" :loading="loading" striped-rows>
      <Column field="name" header="Nama" />
      <Column field="year" header="Tahun" />
      <Column header="Status">
        <template #body="{ data }">
          <span
            v-if="data.is_current"
            class="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium"
          >
            Aktif
          </span>
        </template>
      </Column>
      <Column header="Aksi" style="width: 1%">
        <template #body="{ data }">
          <div class="flex items-center gap-1 whitespace-nowrap">
            <Button
              v-if="!data.is_current"
              label="Jadikan Aktif"
              text
              size="small"
              @click="markCurrent(data)"
            />
            <Button
              label="Duplikat"
              icon="pi pi-copy"
              text
              size="small"
              severity="secondary"
              @click="duplicateSemester(data)"
            />
            <Button
              v-if="data.is_current"
              label="Reset"
              icon="pi pi-refresh"
              text
              size="small"
              severity="danger"
              @click="resetCurrent(data)"
            />
          </div>
        </template>
      </Column>

      <template #empty> Tidak ada data. </template>
    </DataTable>

    <ConfirmActionDialog ref="confirmDialog" />
  </div>
</template>
