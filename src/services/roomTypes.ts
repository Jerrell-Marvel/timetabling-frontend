import { createResource } from './resource'
import type { RoomType } from '@/types'

/** `resource('roomTypes')`. */
export const roomTypesService = createResource<RoomType>('roomTypes')
