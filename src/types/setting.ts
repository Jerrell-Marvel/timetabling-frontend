import type { Id } from './common'

/**
 * `SettingableType.dbValue` — the keys of the constraints map.
 *
 * These are the legacy camelCase discriminators stored in
 * `setting_constraints.settingable_type`, NOT API paths — `activityType` values
 * are listed from `/api/activity-types`.
 */
export type SettingableType =
  | 'roomType'
  | 'room'
  | 'activityType'
  | 'activity'
  | 'waktu'
  | 'hari'
  | 'jurusan'

/** Every type the backend iterates in `writeConstraints`. */
export const SETTINGABLE_TYPES: SettingableType[] = [
  'roomType',
  'room',
  'activityType',
  'activity',
  'waktu',
  'hari',
  'jurusan',
]

/** Constraint values are stringified ids / hours (7–23) / day indexes (1–6). */
export type SettingConstraints = Partial<Record<SettingableType, string[]>>

/** Row of `GET /api/settings` — mirrors `SettingResponse`. */
export interface Setting {
  id: Id
  name: string
  semesterId: Id | null
  /** `"{type} {academicYear}"`, e.g. `"Genap 2019/2020"`. */
  typeAndSemester: string | null
}

/**
 * `GET /api/settings/{id}` — mirrors `SettingDetailResponse`.
 *
 * A type with no stored rows comes back **expanded to its full default set**,
 * so what you receive is always the effective selection.
 *
 * For a non-admin the response is additionally narrowed to their faculty's
 * `jurusan` and `activity` values. That view is read-only by construction —
 * setting writes are ADMIN-only — so it can never be saved back and shrink the
 * stored setting.
 */
export interface SettingDetail extends Setting {
  constraints: SettingConstraints
}

/**
 * Write shape — mirrors `SettingRequest`.
 *
 * Only the types present in `constraints` or `selectAll` are rewritten; a type
 * absent from both is left untouched rather than widened to "all". Sending all
 * seven (as `SettingFormView` does) keeps the form the single source of truth.
 */
export interface SettingPayload {
  name: string
  /** Optional; null = current semester. Honoured on create, IGNORED on update. */
  semesterId?: Id | null
  constraints: SettingConstraints
  /** Types where "all" is selected — persisted as zero rows. */
  selectAll: string[]
}

/** Local form state — every constraint key is always present. */
export interface SettingFormState {
  name: string
  semesterId: Id | null
  constraints: Record<SettingableType, string[]>
}
