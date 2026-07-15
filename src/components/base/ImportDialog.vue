<script setup lang="ts">
/**
 * Replaces legacy `UploadComponent`. `endpoints` is an array precisely to
 * preserve the legacy two-import-type flows (lecturers: base/time; activities:
 * base/data) — single-import domains pass a one-element array and the type
 * selector is hidden.
 */
import { computed, ref, watch } from 'vue'
import type { FileUploadSelectEvent } from 'primevue/fileupload'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/lib/api'

export interface ImportEndpoint {
  key: string
  label: string
  upload: (file: File) => Promise<unknown>
}

const props = defineProps<{
  visible: boolean
  endpoints: ImportEndpoint[]
  header?: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  uploaded: [payload: { endpoint: ImportEndpoint; result: unknown }]
}>()

const toast = useToast()
const selectedKey = ref(props.endpoints[0]?.key)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      selectedKey.value = props.endpoints[0]?.key
      selectedFile.value = null
    }
  },
)

const endpointOptions = computed(() =>
  props.endpoints.map((endpoint) => ({ label: endpoint.label, value: endpoint.key })),
)

function onSelect(event: FileUploadSelectEvent) {
  const files = event.files as File[]
  selectedFile.value = files[0] ?? null
}

function onClear() {
  selectedFile.value = null
}

async function submit() {
  const endpoint = props.endpoints.find((e) => e.key === selectedKey.value)
  if (!endpoint || !selectedFile.value) return

  uploading.value = true
  try {
    const result = await endpoint.upload(selectedFile.value)
    toast.success(`${endpoint.label} berhasil diunggah.`)
    emit('uploaded', { endpoint, result })
    emit('update:visible', false)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Gagal mengunggah file.'))
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="header ?? 'Impor Data'"
    :style="{ width: '28rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <div v-if="endpoints.length > 1">
        <label class="block text-sm font-medium text-surface-700 mb-2">Jenis Data</label>
        <Select
          v-model="selectedKey"
          :options="endpointOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <FileUpload
        mode="basic"
        :auto="false"
        choose-label="Pilih File"
        accept=".xlsx,.xls,.csv"
        :max-file-size="5000000"
        @select="onSelect"
        @clear="onClear"
      />

      <Message v-if="!selectedFile" severity="secondary" :closable="false">
        Pilih file Excel/CSV untuk diunggah.
      </Message>
    </div>

    <template #footer>
      <Button label="Batal" text severity="secondary" @click="emit('update:visible', false)" />
      <Button
        label="Unggah"
        icon="pi pi-upload"
        :loading="uploading"
        :disabled="!selectedFile"
        @click="submit"
      />
    </template>
  </Dialog>
</template>
