import type { Id } from './common'

/** A minimum-gap-in-days constraint between this activity and another. */
export interface DayGap {
  activity_id: Id
  min_gap_day: number
}

/**
 * Activity (`activities`): a scheduled teaching unit for a semester. Carries the
 * candidate rooms/room-types/lecturers, parallel count, and min-day-gap rows.
 */
export interface Activity {
  id?: Id
  semester_id: Id
  course_id: Id
  quota: number
  duration: number
  parallel: number
  room_ids: Id[]
  room_type_ids: Id[]
  lecturer_ids: Id[]
  day_gaps: DayGap[]
}
