import api from '@/lib/api'
import type { Id } from '@/types'

/**
 * Factory for a standard Laravel `Route::resource` client (index/show/store/
 * update/destroy). Domain modules spread this and add custom endpoints.
 *
 * @typeParam T - the entity shape returned by the API.
 * @typeParam P - the create/update payload shape (defaults to `Partial<T>`).
 */
export function createResource<T, P = Partial<T>>(base: string) {
  return {
    list: (params?: Record<string, unknown>) =>
      api.get<T[]>(`/${base}`, { params }).then((r) => r.data),

    get: (id: Id) => api.get<T>(`/${base}/${id}`).then((r) => r.data),

    create: (payload: P) => api.post<T>(`/${base}`, payload).then((r) => r.data),

    update: (id: Id, payload: P) =>
      api.put<T>(`/${base}/${id}`, payload).then((r) => r.data),

    destroy: (id: Id) => api.delete<void>(`/${base}/${id}`).then((r) => r.data),
  }
}

// ── Shared helpers for the file up/download endpoints ──────────────────────

/** Download an endpoint as a Blob (Excel templates / exports). */
export function download(url: string, params?: Record<string, unknown>) {
  return api.get<Blob>(url, { params, responseType: 'blob' }).then((r) => r.data)
}

/** POST a single-file upload as multipart form data. */
export function upload<R = unknown>(url: string, file: File, field = 'file') {
  const form = new FormData()
  form.append(field, file)
  return api
    .post<R>(url, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data)
}
