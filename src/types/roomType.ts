import type { Id } from './common'

/** Room type (`room_types`), mirroring `RoomTypeResponse` verbatim. */
export interface RoomType {
  id: Id
  name: string
}

/** Write shape for `POST`/`PUT /api/room-types` — mirrors `RoomTypeRequest`. */
export interface RoomTypePayload {
  name: string
}
