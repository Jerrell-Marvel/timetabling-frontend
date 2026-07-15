import api from '@/lib/api'
import { createResource } from './resource'
import type { Id, Semester } from '@/types'

/** `resource('semesters')` + add-next / duplicate / mark-current / delete. */
export const semestersService = {
  ...createResource<Semester>('semesters'),

  next: () => api.post<Semester>('/semesters/next').then((r) => r.data),
  duplicate: (id: Id) => api.post<Semester>('/semesters/duplicate', { id }).then((r) => r.data),
  setCurrent: (id: Id) => api.put<Semester>('/semesters-current', { id }).then((r) => r.data),
  remove: (id: Id) => api.delete<void>('/semester-delete', { data: { id } }).then((r) => r.data),
}
