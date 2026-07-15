import type { Id } from './common'

/** A per-day availability window for a room. */
export interface RoomAvailability {
  day: string
  start: string
  end: string
}

/** Room (`rooms`): location/capacity, parent/type, and a six-day availability grid. */
export interface Room {
  id?: Id
  code: string
  owner?: string | null
  campus: string
  building: string
  floor: string
  capacity: number
  parent_id?: Id | null
  room_type_id: Id
  availabilities: RoomAvailability[]
}
