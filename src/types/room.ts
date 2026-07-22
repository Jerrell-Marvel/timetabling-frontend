import type { Id } from './common'
import type { RoomType } from './roomType'

/**
 * One availability window, mirroring `RoomAvailableResponse`.
 * `day` is 1 = Senin … 6 = Sabtu; times are `"HH:mm"`.
 */
export interface RoomAvailability {
  id?: Id
  roomId?: Id
  day: number
  startTime: string
  endTime: string
}

/**
 * Availability as accepted by `RoomRequest.availabilities`
 * (`RoomAvailableItemRequest`).
 *
 * Carries no `roomId`: the owning room is the one being saved, and the service
 * re-links every row to it. Only OPEN days need sending — the backend writes the
 * remaining days as explicit `00:00–00:00` closed rows, so a room always has all
 * six. Sending an empty list on CREATE seeds the default Mon–Sat 07:00–18:00.
 */
export interface RoomAvailabilityPayload {
  /** 1–6 (`@Min(1) @Max(6)`). */
  day: number
  startTime: string
  endTime: string
}

/** A day whose window is `00:00–00:00` is closed, not open at midnight. */
export function isClosed(a: Pick<RoomAvailability, 'startTime' | 'endTime'>): boolean {
  return a.startTime === a.endTime
}

/** Room (`rooms`), mirroring `RoomResponse` verbatim. */
export interface Room {
  id: Id
  roomCode: string
  name: string
  unitOwner: string
  location: string
  building: string
  floor: string
  capacity: number
  /** Nullable free-text column, NOT a boolean. */
  virtual?: string | null
  parentRoomId?: Id | null
  /** Ids of rooms whose parent is this room (read-only). */
  childIds: Id[]
  roomTypeId: Id
  /** Nested type, so views need no second request. */
  roomType?: RoomType
  availabilities: RoomAvailability[]
}

/** Write shape for `POST`/`PUT /api/rooms` — mirrors `RoomRequest`. */
export interface RoomPayload {
  roomCode: string
  name: string
  unitOwner: string
  location: string
  building: string
  floor: string
  capacity: number | null
  /** Nullable; the service also treats 0 as "no parent". */
  parentRoomId?: Id | null
  roomTypeId: Id | null
  virtual?: string | null
  availabilities: RoomAvailabilityPayload[]
}
