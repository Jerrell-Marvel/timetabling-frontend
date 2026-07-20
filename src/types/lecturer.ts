import type { Id } from './common'

/**
 * `LecturerTimeType` as serialized by Jackson (enum name, not the DB value —
 * the DB stores "Not-Available"/"Priority" via `LecturerTimeTypeConverter`).
 */
export type LecturerTimeType = 'NOT_AVAILABLE' | 'PRIORITY'

/**
 * One row of `lecturer_time_n_as`, mirroring `LecturerTimeResponse` verbatim.
 * Note the backend already groups these by type on `Lecturer`, so `type` is
 * rarely needed on the read path.
 */
export interface LecturerTime {
  id?: Id
  lecturerId?: Id
  /** Day index: 1 = Senin … 6 = Sabtu (same convention as `times.day`/`DayTabs`). */
  day: number
  /** "HH:mm" — Jackson `@JsonFormat(pattern = "HH:mm")`. */
  startTime: string
  /** "HH:mm" — Jackson `@JsonFormat(pattern = "HH:mm")`. */
  endTime: string
  type: LecturerTimeType
}

/**
 * Lecturer, mirroring `LecturerResponse` verbatim. The backend returns times
 * pre-grouped as `notAvailable` + `priority` — there is no flat `times` array.
 */
export interface Lecturer {
  id?: Id
  nik: string
  name: string
  /** `lecturers.home_base` — NOT NULL, and `@NotNull` on `LecturerRequest`. */
  homeBase: number | null
  alias?: string | null
  notAvailable: LecturerTime[]
  priority: LecturerTime[]
}

/**
 * Write shape for `POST`/`PUT /api/lecturers` — mirrors `LecturerRequest`.
 * Deliberately excludes times: the backend does NOT accept them here, they are
 * managed separately via `/api/lecturer-times`.
 */
export interface LecturerPayload {
  nik: string
  name: string
  homeBase: number | null
  alias?: string | null
}

/** Write shape for `POST`/`PUT /api/lecturer-times` — mirrors `LecturerTimeRequest`. */
export interface LecturerTimePayload {
  lecturerId: Id
  /** 1–6 (`@Min(1) @Max(6)`). */
  day: number
  startTime: string
  endTime: string
  type: LecturerTimeType
}
