import type { Id } from './common'

/**
 * `SettingableType.dbValue` — the keys of the constraints map.
 *
 * NOTE: `activityType` has no listing endpoint on this backend (there is no
 * ActivityType controller), so the UI cannot render a picker for it. Its values
 * are read from the detail response and written back untouched.
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
 */
export interface SettingDetail extends Setting {
  constraints: SettingConstraints
}

/**
 * Write shape — mirrors `SettingRequest`.
 *
 * WARNING: `update` hard-deletes every constraint row and re-inserts from this
 * payload, so a type omitted here silently becomes "all". Always send all types.
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
