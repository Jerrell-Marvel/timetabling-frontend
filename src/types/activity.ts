import type { Id } from './common'

/**
 * Every restriction that can be attached to an Activity. Mirrors the Java
 * `ConstraintType` enum — Jackson serializes the enum *name*, not the legacy DB
 * string ("Lecturer"/"Room"/"RoomType"/"Paralel"/"Gap"), which the backend's
 * `ConstraintTypeConverter` keeps to itself.
 */
export type ConstraintType = 'LECTURER' | 'ROOM' | 'ROOM_TYPE' | 'PARALEL' | 'GAP'

/**
 * One row of `activity_constraints`, mirroring `ActivityConstraintResponse`.
 *
 * `value` is an opaque string whose meaning depends on `type`:
 * - `LECTURER` → lecturer NIK
 * - `ROOM` / `ROOM_TYPE` → that row's id, stringified
 * - `PARALEL` / `GAP` → the *other* activity's id, stringified
 *
 * The server resolves `valueLabel` for display, so no client has to
 * re-implement that five-way lookup.
 */
export interface ActivityConstraint {
  id?: Id
  activityId?: Id
  type: ConstraintType
  value: string
  /** Hard = the scheduler must satisfy it; soft = preference, penalty only. */
  isHard: boolean
  /** Minimum days between the pair. `GAP` only. */
  minGap?: number | null
  /** Server-resolved display name for `value`; null when the target is gone. */
  valueLabel?: string | null
}

/**
 * Activity (`activities`), mirroring `ActivityResponse` verbatim — master data
 * only. Constraints are fetched separately from
 * `GET /api/activity-constraints?activityId=`.
 */
export interface Activity {
  id?: Id
  semesterId: Id
  /** Write key; the actual FK on the table is `courseCode`. */
  courseId: Id
  courseCode?: string
  courseName?: string
  courseClass: string
  courseSession: number
  duration: number
  quota: number
  activityTypeId: Id
  activityTypeName?: string
  /** Display name, e.g. "Basis Data IF201 - A (1)". */
  name?: string
  /** Course colour (jurusan hue + tingkat), e.g. `hsl(1,100%,95%)`. */
  color?: string
}

/** Write shape for `POST`/`PUT /api/activities` — mirrors `ActivityRequest`. */
export interface ActivityPayload {
  semesterId: Id
  courseId: Id
  courseClass: string
  courseSession: number
  duration: number
  quota: number
  activityTypeId: Id
}

/** One picked room / room type / paralel, with its hard-or-soft choice. */
export interface ConstraintChoice {
  value: string
  isHard: boolean
}

/** A minimum-gap-in-days constraint against another activity. */
export interface GapChoice extends ConstraintChoice {
  minGap: number
}

/**
 * What the Activity form binds to: one flat object covering both the activity
 * row and all five constraint kinds. `activitiesService` splits it across the
 * two APIs on save and reassembles it on load, so no view touches
 * `/api/activity-constraints` directly.
 *
 * Lecturers are plain NIKs rather than {@link ConstraintChoice}: the backend
 * pins `LECTURER` to hard, so a per-row toggle would be a lie in the UI.
 */
export interface ActivityFormModel extends ActivityPayload {
  lecturerNiks: string[]
  rooms: ConstraintChoice[]
  roomTypes: ConstraintChoice[]
  paralels: ConstraintChoice[]
  gaps: GapChoice[]
}

/** A blank form model — the single source of truth for "new activity" defaults. */
export function emptyActivityForm(): ActivityFormModel {
  return {
    semesterId: 0,
    courseId: 0,
    courseClass: '',
    courseSession: 1,
    duration: 1,
    quota: 1,
    activityTypeId: 0,
    lecturerNiks: [],
    rooms: [],
    roomTypes: [],
    paralels: [],
    gaps: [],
  }
}
