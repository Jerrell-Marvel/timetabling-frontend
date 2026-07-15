import api from '@/lib/api'
import type {
  GeneratePayload,
  Id,
  SaveTablePayload,
  ScheduleInitData,
  TimetableRefData,
} from '@/types'

/**
 * Scheduling-board endpoints (R3). Validation stays client-side; the backend is
 * called only for ref-data / init / generate / save / revalidate / reset / show.
 */
export const timetableService = {
  refData: () => api.get<TimetableRefData>('/timetable-data').then((r) => r.data),
  initSchedule: () => api.get<ScheduleInitData>('/getInitSchedule').then((r) => r.data),

  generate: (payload: GeneratePayload) =>
    api.post<ScheduleInitData>('/timetable', payload).then((r) => r.data),

  save: (payload: SaveTablePayload) =>
    api.post<{ ok: boolean }>('/save-table', payload).then((r) => r.data),

  // Admin
  revalidate: () => api.get<ScheduleInitData>('/activity/revalidate').then((r) => r.data),
  reset: () => api.get<{ ok: boolean }>('/activity/reset').then((r) => r.data),

  // Read-only result snapshot
  show: (id: Id) => api.get<ScheduleInitData>(`/show-timetable/${id}`).then((r) => r.data),
}
