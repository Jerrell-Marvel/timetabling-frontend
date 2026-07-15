import { createResource, download, upload } from './resource'
import type { Lecturer } from '@/types'

/** `resource('lecturers')` + Excel template/download + two import types. */
export const lecturersService = {
  ...createResource<Lecturer>('lecturers'),

  // Downloads (Excel templates / exports)
  excelLecturer: () => download('/excel-lecturer'),
  excelLecturerTime: () => download('/excel-lecturer-time'),

  // Two import types: base lecturers, and lecturer time constraints
  uploadLecturer: (file: File) => upload('/uploads-lecturer', file),
  uploadLecturerTime: (file: File) => upload('/uploads-lecturer-time', file),
}
