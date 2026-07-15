import api from '@/lib/api'
import { createResource, download, upload } from './resource'
import type { Activity, Id } from '@/types'

/** `resource('activities')` + by-semester/detail fetch + two import types. */
export const activitiesService = {
  ...createResource<Activity>('activities'),

  bySemester: (sems: Id) => api.get<Activity[]>(`/activities/sems/${sems}`).then((r) => r.data),
  data: (id: Id) => api.get<Activity>(`/activities/data/${id}`).then((r) => r.data),

  excelActivities: () => download('/excel-activities'),

  // Two import types: per-activity data, and the combined "all activity" excel
  uploadActivities: (file: File) => upload('/uploads-activities', file),
  uploadAllActivity: (file: File) => upload('/AllActivityExcel', file),
}
