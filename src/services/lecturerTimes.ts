import { createResource } from './resource'
import type { Id, LecturerTime, LecturerTimePayload } from '@/types'

const resource = createResource<LecturerTime, LecturerTimePayload>('lecturer-times')

/**
 * `/api/lecturer-times` (`LecturerTimeNAController`). Lecturer availability is a
 * separate resource from the lecturer itself — `LecturerRequest` accepts no times.
 */
export const lecturerTimesService = {
  ...resource,

  /** `GET /api/lecturer-times?lecturerId=3` */
  listByLecturer: (lecturerId: Id) => resource.list({ lecturerId }),
}
