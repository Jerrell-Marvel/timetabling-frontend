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

/**
 * `GET /api/courses/{id}/constraints` — mirrors `CourseConstraintsResponse`.
 *
 * Served separately from the course itself so the listing stays one query;
 * `courseIds` already merges both directions of the symmetric relation.
 */
export interface CourseConstraints {
  /** Ids of courses this one may not be scheduled alongside ("Matakuliah Bentrok"). */
  courseIds: Id[]
  /** Semesters 1–8 it may not be scheduled alongside ("Semester Bentrok"). */
  semesters: number[]
}

/** Write shape for `POST`/`PUT /api/courses` — mirrors `CourseRequest`. */
export interface CoursePayload {
  code: string
  name: string
  type: CourseType
  tingkat?: number | null
  konsentrasi?: string | null
  jurusanId: Id
  /**
   * Conflict sets, replace-all. Omitting a field (`undefined`) leaves that side
   * untouched server-side; `[]` clears it. Always send both from the form so what
   * the user sees is what is stored.
   */
  courseConstraints?: Id[]
  semesterConstraints?: number[]
}

/** Lightweight course info returned by `GET /api/courses/{id}/info`. */
export interface CourseInfo {
  id: Id
  code: string
  name: string
  tingkat?: number | null
  konsentrasi?: string | null
}
