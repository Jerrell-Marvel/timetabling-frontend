import api from '@/lib/api'
import { createResource, download, upload } from './resource'
import type { Course, CourseInfo, Id } from '@/types'

/** `resource('courses')` + dependent fetches + Excel template/import. */
export const coursesService = {
  ...createResource<Course>('courses'),

  // Dependent fetches (course → concentration → course list)
  courseInfo: (id: Id) => api.get<CourseInfo>(`/courseInfo/${id}`).then((r) => r.data),
  konsentrasi: (id: Id) => api.get<string[]>(`/konsentrasi/${id}`).then((r) => r.data),
  courselist: (id: Id) => api.get<Course[]>(`/courselist/${id}`).then((r) => r.data),

  excelCourse: () => download('/excel-course'),
  uploadCourse: (file: File) => upload('/uploads-course', file),
}
