import type { Id } from './common'

/** A saved timetable snapshot (`results`). No create/update form — action-only. */
export interface Result {
  id: Id
  name: string
  semester_id: Id
  created_at?: string
}
