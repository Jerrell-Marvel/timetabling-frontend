<script setup lang="ts">
/**
 * Single home for confirmed actions — replaces `RevalidateComponent`,
 * `ForceInsertModalComponent`, and every legacy `confirm()` call. Delete
 * confirmation, semester actions, results delete, revalidate, reset, and
 * force-insert all go through the imperative `confirm()` exposed here.
 *
 * Plain confirmations resolve immediately on accept. Set `withProgress: true`
 * for actions that need in-flight feedback (revalidate, force-insert): the
 * overlay blocks the UI while `accept()` runs, then a toast reports the result.
 */
import { ref } from 'vue'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/lib/api'
import LoadingOverlay from './LoadingOverlay.vue'

export interface ConfirmActionOptions {
  message: string
  header?: string
  acceptLabel?: string
  rejectLabel?: string
  acceptSeverity?: string
  icon?: string
  accept: () => void | Promise<void>
  onReject?: () => void
  withProgress?: boolean
  progressLabel?: string
  successMessage?: string
  errorMessage?: string
}

const confirmApi = useConfirm()
const toast = useToast()
const processing = ref(false)
const progressLabel = ref<string | undefined>()

async function confirmAction(options: ConfirmActionOptions) {
  confirmApi.require(
    options.message,
    async () => {
      if (!options.withProgress) {
        await options.accept()
        return
      }

      processing.value = true
      progressLabel.value = options.progressLabel
      try {
        await options.accept()
        toast.success(options.successMessage ?? 'Berhasil diproses.')
      } catch (error) {
        toast.error(getErrorMessage(error, options.errorMessage ?? 'Gagal diproses.'))
      } finally {
        processing.value = false
      }
    },
    {
      header: options.header,
      acceptLabel: options.acceptLabel,
      rejectLabel: options.rejectLabel,
      acceptSeverity: options.acceptSeverity,
      icon: options.icon,
      onReject: options.onReject,
    },
  )
}

defineExpose({ confirm: confirmAction })
</script>

<template>
  <LoadingOverlay :active="processing" :label="progressLabel" />
</template>
