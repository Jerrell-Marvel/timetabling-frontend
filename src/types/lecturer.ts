import type { Id } from './common'

/** A single lecturer time constraint. `type` distinguishes unavailable vs. preferred. */
export interface LecturerTime {
  id?: Id
  day: string
  start: string
  end: string
  /** Legacy `lecturer_times.type` — `"Unavailable"` or `"Priority"` (preferred). */
  type: 'Unavailable' | 'Priority'
}

/** Lecturer (`lecturers`): identity plus unavailable + preferred time slots. */
export interface Lecturer {
  id?: Id
  nik: string
  name: string
  alias?: string | null
  times: LecturerTime[]
}
