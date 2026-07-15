import type { Id } from './common'

/**
 * A named scheduling setting/profile for the current semester. Encodes the
 * program/activity/room/room-type/day/time restrictions (or special-activity
 * selection) chosen through the settings form's hierarchy/pick-list controls.
 */
export interface Setting {
  id?: Id
  name: string
  semester_id: Id
  prodi_ids: Id[]
  activity_ids: Id[]
  room_ids: Id[]
  room_type_ids: Id[]
  days: string[]
  time_ranges: { start: string; end: string }[]
}
