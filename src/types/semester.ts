import type { Id } from './common'

/**
 * Academic semester, mirroring `SemesterResponse` verbatim. There is no `name`
 * column — the display label is `"{type} {academicYear}"` (which is what the
 * backend itself returns as `Setting.typeAndSemester`).
 */
export interface Semester {
  id?: Id
  /** e.g. "Ganjil", "Genap", "Pendek". */
  type: string
  /** e.g. "2020/2021". */
  academicYear: string
  /** Exactly one semester is flagged current. */
  current?: boolean
}

/** Display label for a semester — matches the backend's `typeAndSemester`. */
export function semesterLabel(s: Semester): string {
  return `${s.type} ${s.academicYear}`
}
