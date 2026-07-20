import { createResource } from './resource'
import type { RoomType, RoomTypePayload } from '@/types'

/**
 * `/api/room-types` (`RoomTypeController`).
 *
 * NOTE the kebab-case path: this was previously `'roomTypes'`, which resolved to
 * `/api/roomTypes` — an unmapped URL the backend reported as a 500.
 */
export const roomTypesService = createResource<RoomType, RoomTypePayload>('room-types')
