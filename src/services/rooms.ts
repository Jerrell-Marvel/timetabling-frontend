import { createResource, download, upload } from './resource'
import type { Room } from '@/types'

/** `resource('rooms')` + Excel template/import. */
export const roomsService = {
  ...createResource<Room>('rooms'),

  excelRoom: () => download('/excel-room'),
  uploadRoom: (file: File) => upload('/uploads-room', file),
}
