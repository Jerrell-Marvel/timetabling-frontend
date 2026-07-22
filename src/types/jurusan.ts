import type { Id } from './common'

/** `Jenjang` enum — Jackson serializes it by name. */
export type Jenjang = 'D3' | 'S1' | 'S2' | 'S3'

/**
 * Department (`jurusans`), mirroring `JurusanResponse` verbatim. Replaces the
 * old `Prodi` concept — the backend has no `/prodis` endpoint.
 *
 * This is what `lecturers.home_base` and `courses.jurusan_id` point at.
 */
export interface Jurusan {
  id: Id
  name: string
  faculty: string | null
  jenjang: Jenjang
  color: number | null
}

/** Write shape for `POST`/`PUT /api/jurusans` — mirrors `JurusanRequest`. */
export interface JurusanPayload {
  name: string
  faculty?: string | null
  jenjang: Jenjang | null
  color?: number | null
}

/**
 * `GET /api/jurusans/{id}/konsentrasi` (and `/api/konsentrasi`) — mirrors
 * `KonsentrasiResponse`.
 */
export interface Konsentrasi {
  id: Id
  jurusanId: Id
  konsentrasi: string
}

/**
 * Write shape for `POST`/`PUT /api/konsentrasi` — mirrors `KonsentrasiRequest`.
 *
 * Concentrations are their own resource, not a field of `JurusanRequest`: Laravel
 * rewrote the whole `kons[]` array on every Prodi save, which destroyed row ids.
 * The Jurusan form reconciles add/edit/remove against the loaded list instead.
 */
export interface KonsentrasiPayload {
  jurusanId: Id
  konsentrasi: string
}

/** One row of the Jurusan form's concentration editor (unsaved rows have no `id`). */
export interface KonsentrasiDraft {
  id?: Id
  konsentrasi: string
}
