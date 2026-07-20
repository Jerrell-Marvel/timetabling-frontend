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
 * `GET /api/jurusans/{id}/konsentrasi` — mirrors `KonsentrasiResponse`.
 *
 * Read-only: `JurusanRequest` carries no concentrations and the backend exposes
 * no Konsentrasi write endpoint, so these cannot be created/edited from the UI.
 */
export interface Konsentrasi {
  id: Id
  jurusanId: Id
  konsentrasi: string
}
