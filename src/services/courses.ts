import api from '@/lib/api'
import { createResource, download, upload } from './resource'
import type { Course, CourseConstraints, CourseInfo, CoursePayload, Id } from '@/types'

const resource = createResource<Course, CoursePayload>('courses')

/** `resource('courses')` + dependent fetches + Excel template/import. */
export const coursesService = {
  ...resource,

  /** `GET /api/courses/{id}/info` */
  courseInfo: (id: Id) => api.get<CourseInfo>(`/courses/${id}/info`).then((r) => r.data),

  /**
   * `GET /api/courses/{id}/constraints` — the "Matakuliah Bentrok" / "Semester
   * Bentrok" sets. Writes go back on the course payload itself, not here.
   */
  constraints: (id: Id) =>
    api.get<CourseConstraints>(`/courses/${id}/constraints`).then((r) => r.data),

  /** `GET /api/courses/by-jurusan/{id}` — candidate courses for a department. */
  byJurusan: (jurusanId: Id) =>
    api.get<Course[]>(`/courses/by-jurusan/${jurusanId}`).then((r) => r.data),

  excelCourse: () => download('/excel-course'),
  uploadCourse: (file: File) => upload('/uploads-course', file),
}
