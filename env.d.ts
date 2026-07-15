/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_CSRF_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// PrimeVue ships this internal event bus without types; used by api.ts to raise
// toasts outside a component setup context (same bus ToastService.add() emits on).
declare module 'primevue/toasteventbus' {
  interface ToastEventBus {
    emit(event: string, payload?: unknown): void
    on(event: string, handler: (payload?: unknown) => void): void
    off(event: string, handler: (payload?: unknown) => void): void
  }
  const bus: ToastEventBus
  export default bus
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
