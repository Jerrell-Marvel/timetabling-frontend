import { createResource } from './resource'
import type { Room, RoomPayload } from '@/types'

/**
 * `/api/rooms` (`RoomController`).
 *
 * The Excel template/import helpers were removed: `RoomController` documents
 * export/import as "added in Phase 9", so `/excel-room` and `/uploads-room`
 * do not exist on this backend.
 */
export const roomsService = createResource<Room, RoomPayload>('rooms')
