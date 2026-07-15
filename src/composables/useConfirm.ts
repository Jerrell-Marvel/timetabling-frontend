import { useConfirm as usePrimeConfirm } from 'primevue/useconfirm'

interface ConfirmOptions {
  header?: string
  acceptLabel?: string
  rejectLabel?: string
  /** PrimeVue severity for the accept button (e.g. `'danger'` for deletes). */
  acceptSeverity?: string
  icon?: string
  onReject?: () => void
}

/**
 * Helper over PrimeVue's `useConfirm`. Replaces native `confirm()` and the legacy
 * revalidate / force-insert modal triggers. Backs the Phase 2
 * `ConfirmActionDialog`. Must be called from `setup`.
 */
export function useConfirm() {
  const confirm = usePrimeConfirm()

  /** Standard confirm(message, accept). Resolves nothing — acts via callbacks. */
  function require(message: string, accept: () => void, options: ConfirmOptions = {}) {
    confirm.require({
      message,
      header: options.header ?? 'Konfirmasi',
      icon: options.icon ?? 'pi pi-exclamation-triangle',
      acceptLabel: options.acceptLabel ?? 'Ya',
      rejectLabel: options.rejectLabel ?? 'Batal',
      acceptProps: { severity: options.acceptSeverity ?? 'primary' },
      accept,
      reject: options.onReject,
    })
  }

  /** Preset for destructive actions (danger accept button). */
  function requireDelete(accept: () => void, message = 'Yakin ingin menghapus data ini?') {
    require(message, accept, { header: 'Hapus', acceptSeverity: 'danger', acceptLabel: 'Hapus' })
  }

  return { require, requireDelete }
}
