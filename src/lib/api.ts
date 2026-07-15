import axios, { AxiosError, type AxiosInstance } from 'axios'
import ToastEventBus from 'primevue/toasteventbus'
import type { ValidationErrorBody } from '@/types'

/**
 * Single Axios instance for the whole SPA.
 *
 * Auth strategy (single-sourced, R-audit): **cookie-based Laravel session with
 * CSRF**, matching the legacy `web.php` routes. `withCredentials` sends the
 * session cookie; Axios auto-attaches the `XSRF-TOKEN` cookie as the
 * `X-XSRF-TOKEN` header (see `xsrf*` options). Call {@link ensureCsrf} before the
 * first mutating request in a session (login) to prime the cookie.
 *
 * All raw `fetch` + manual CSRF coupling from the legacy `services/*.js` is
 * replaced by this module.
 */
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

/** Prime the CSRF cookie (Sanctum-style). Override the path via `VITE_CSRF_URL`. */
export async function ensureCsrf(): Promise<void> {
  await api.get(import.meta.env.VITE_CSRF_URL ?? '/sanctum/csrf-cookie')
}

// ── Type guards / helpers for error handling ───────────────────────────────
export function isValidationError(
  error: unknown,
): error is AxiosError<ValidationErrorBody> {
  return axios.isAxiosError(error) && error.response?.status === 422
}

/** Extract a human-readable message from any thrown API error. */
export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan.'): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? error.message ?? fallback
  }
  return fallback
}

function toast(severity: 'error' | 'warn', summary: string, detail: string, life = 5000) {
  ToastEventBus.emit('add', { severity, summary, detail, life })
}

// ── Response interceptor ───────────────────────────────────────────────────
// 401 → clear session + redirect to login; 403 → toast; 422 → pass through to
// the form (useApiForm); 5xx/network → generic toast.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ValidationErrorBody>) => {
    const status = error.response?.status

    if (status === 401 || status === 419) {
      // Break the api ↔ store import cycle with a dynamic import.
      const [{ useAuthStore }, { default: router }] = await Promise.all([
        import('@/stores/auth'),
        import('@/router'),
      ])
      const auth = useAuthStore()
      auth.clearSession()
      if (router.currentRoute.value.name !== 'login') {
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }
    } else if (status === 403) {
      toast('error', 'Ditolak', getErrorMessage(error, 'Anda tidak memiliki akses.'))
    } else if (status === 422) {
      // Field errors are handled by useApiForm at the call site — no toast.
    } else if (!error.response) {
      toast('error', 'Koneksi', 'Tidak dapat terhubung ke server.')
    } else if (status && status >= 500) {
      toast('error', 'Server', getErrorMessage(error, 'Kesalahan server.'))
    }

    return Promise.reject(error)
  },
)

export default api
