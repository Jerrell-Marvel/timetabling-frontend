import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import ToastEventBus from 'primevue/toasteventbus'
import type { ValidationErrorBody } from '@/types'

/**
 * Single Axios instance for the whole SPA.
 *
 * Auth strategy: **stateless JWT** against the Spring Boot backend (Laravel's
 * cookie/CSRF/Sanctum flow is dropped). A bearer token is stored in
 * `localStorage` and attached to every request by the request interceptor.
 *
 * IMPORTANT — path convention: Spring serves every route under `/api`
 * (e.g. `/api/courses`, `/api/auth/login`). The domain services in
 * `src/services/*` still call bare paths like `/courses`, so `baseURL` must
 * resolve to `.../api` for them to reach the backend. Set `VITE_API_URL`
 * accordingly (see `.env`); it defaults to `http://localhost:8085`.
 *
 * Casing note for future services: responses are `camelCase` **except**
 * `/api/activities`, whose request/response bodies are `snake_case`
 * (`semester_id`, `course_class`, `activity_type_id`, …). Activity payloads
 * must be mapped verbatim — do not camelCase them.
 */

// ── Token storage (single source of truth) ─────────────────────────────────
const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8085',
  headers: {
    Accept: 'application/json',
  },
})

/**
 * @deprecated JWT is stateless — no CSRF cookie priming is required. Kept as a
 * no-op so the existing auth store keeps compiling; remove once the auth store
 * migrates off `ensureCsrf`.
 */
export async function ensureCsrf(): Promise<void> {
  /* no-op under JWT */
}

// ── Type guards / helpers for error handling ───────────────────────────────
export function isValidationError(
  error: unknown,
): error is AxiosError<ValidationErrorBody> {
  // Spring bean-validation failures surface as 400; Laravel used 422. Accept both.
  if (!axios.isAxiosError(error)) return false
  const status = error.response?.status
  return status === 400 || status === 422
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

// ── Request interceptor ────────────────────────────────────────────────────
// Attach the JWT as `Authorization: Bearer <token>` when one is present.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor ───────────────────────────────────────────────────
// This Spring backend returns **403** for unauthenticated requests (not only
// 401). Treat both as an auth failure: clear the token and redirect to login.
// 400/422 → pass through to the form (useApiForm); 5xx/network → generic toast.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ValidationErrorBody>) => {
    const status = error.response?.status

    if (status === 401 || status === 403) {
      clearToken()
      // Break the api ↔ store import cycle with a dynamic import.
      const [{ useAuthStore }, { default: router }] = await Promise.all([
        import('@/stores/auth'),
        import('@/router'),
      ])
      useAuthStore().clearSession()
      if (router.currentRoute.value.name !== 'login') {
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }
    } else if ((status === 400 || status === 422) && error.response?.data?.fieldErrors?.length) {
      // Per-field validation — useApiForm renders these inline, so no toast.
    } else if (status === 400 || status === 422) {
      // A 400 with NO `fieldErrors` is a business-rule rejection, not a form error
      // (e.g. BadRequestException "Cannot delete lecturer: ..."). Nothing renders it
      // inline, so it must be toasted or it disappears into an unhandled rejection.
      toast('warn', 'Gagal', getErrorMessage(error, 'Permintaan tidak dapat diproses.'))
    } else if (!error.response) {
      toast('error', 'Koneksi', 'Tidak dapat terhubung ke server.')
    } else if (status && status >= 500) {
      toast('error', 'Server', getErrorMessage(error, 'Kesalahan server.'))
    } else if (status && status >= 400) {
      // Other 4xx the form cannot render inline — notably 409 (duplicate code)
      // and 404. Without this they would fail completely silently.
      toast('warn', 'Gagal', getErrorMessage(error, 'Permintaan tidak dapat diproses.'))
    }

    return Promise.reject(error)
  },
)

export default api
