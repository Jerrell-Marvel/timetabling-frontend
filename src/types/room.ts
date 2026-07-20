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
 * (`RoomAvailableRequest`).
 *
 * WARNING: `roomId` is `@NotNull` even though `RoomService.replaceAvailabilities`
 * ignores it and re-links each row to the owning room. On create there is no id
 * yet, so a placeholder must still be sent or the request fails validation with
 * `availabilities[i].roomId: roomId is required`.
 */
export interface RoomAvailabilityPayload {
  roomId: Id
  /** 1–6 (`@Min(1) @Max(6)`). */
  day: number
  startTime: string
  endTime: string
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
