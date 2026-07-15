import { useToast as usePrimeToast } from 'primevue/usetoast'

/**
 * Thin helper over PrimeVue's `useToast` so components don't repeat severity/life
 * config. Replaces Blade flash messages. Must be called from `setup`.
 */
export function useToast() {
  const toast = usePrimeToast()

  return {
    success: (detail: string, summary = 'Berhasil') =>
      toast.add({ severity: 'success', summary, detail, life: 3000 }),

    error: (detail: string, summary = 'Gagal') =>
      toast.add({ severity: 'error', summary, detail, life: 5000 }),

    warn: (detail: string, summary = 'Perhatian') =>
      toast.add({ severity: 'warn', summary, detail, life: 4000 }),

    info: (detail: string, summary = 'Info') =>
      toast.add({ severity: 'info', summary, detail, life: 3000 }),
  }
}
