import type { Id } from './common'
import type { Jurusan } from './jurusan'

/** `CourseType` enum — the Java constants are literally `Wajib` / `Pilihan`. */
export type CourseType = 'Wajib' | 'Pilihan'

/**
 * Course (`courses`), mirroring `CourseResponse` verbatim.
 *
 * Note the backend embeds the full `jurusan` alongside `jurusanId`, so views can
 * render the department name without a second request.
 */
export interface Course {
  id?: Id
  code: string
  name: string
  type: CourseType
  /** Year level (legacy `semester` on the old frontend type). */
  tingkat: number | null
  konsentrasi?: string | null
  jurusanId: Id
  jurusan?: Jurusan
  /** Server-computed display colour, e.g. `hsl(1,100%,95%)`. */
  color?: string
}

/** Write shape for `POST`/`PUT /api/courses` — mirrors `CourseRequest`. */
export interface CoursePayload {
  code: string
  name: string
  type: CourseType
  tingkat?: number | null
  konsentrasi?: string | null
  jurusanId: Id
}

/** Lightweight course info returned by `GET /api/courses/{id}/info`. */
export interface CourseInfo {
  id: Id
  code: string
  name: string
  tingkat?: number | null
  konsentrasi?: string | null
}
