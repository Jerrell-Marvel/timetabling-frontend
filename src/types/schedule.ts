import type { Id } from './common'

/**
 * Board payload types shared by the Phase 4 scheduling slice and the `timetable`
 * service. Kept intentionally minimal in Phase 0; the ported `Schedule` /
 * `SelectedEdit` / `DBRef` classes (R3) refine these in Phase 4.
 */

/** A single placed activity on the grid. `col` is 0-based from 07:00. */
export interface Placement {
  activity_id: Id
  room_id: Id
  day: string
  col: number
  duration: number
}

/** Reference data for the board (`GET /timetable-data`). */
export interface TimetableData {
  activities: unknown[]
  rooms: unknown[]
}

/** Response shape of init / generate (`{ inserted, notInserted, conflicts }`). */
export interface ScheduleState {
  inserted: Placement[]
  notInserted: Placement[]
  conflicts: Placement[]
}

/** `POST /save-table` body (exact legacy shape). */
export interface SaveTablePayload {
  data: Placement[]
  notInsert: Placement[]
}

/** `POST /timetable` (generate) body. */
export interface GeneratePayload {
  setting_id: Id
  data: Placement[]
}
