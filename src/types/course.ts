import type { Id } from './common'

/** Course (`courses`): program/type/semester/concentration plus no-clash constraints. */
export interface Course {
  id?: Id
  code: string
  name: string
  prodi_id: Id
  type: string
  semester: number
  concentration?: string | null
  /** Prohibited concurrent courses (legacy `MultipleCoursesComponent`). */
  prohibited_course_ids: Id[]
  /** Prohibited concurrent semesters 1–8 (legacy `MultipleSemesterComponent`). */
  prohibited_semesters: number[]
}

/** Lightweight course info returned by `courseInfo/{id}`. */
export interface CourseInfo {
  id: Id
  code: string
  name: string
  semester: number
  concentration?: string | null
}
