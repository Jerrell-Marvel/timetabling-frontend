import api from '@/lib/api'
import { createResource } from './resource'
import type { Id, Jurusan, JurusanPayload, Konsentrasi } from '@/types'

const resource = createResource<Jurusan, JurusanPayload>('jurusans')

/**
 * `/api/jurusans` (`JurusanController`) — replaces the old `prodisService`,
 * which pointed at a `/prodis` route this backend does not have.
 *
 * Note: list/detail are readable by any authenticated user, but create/update/
 * delete are `@PreAuthorize("hasRole('ADMIN')")`, and the list is filtered by
 * the caller's faculty for non-admins.
 */
export const jurusansService = {
  ...resource,

  /** `GET /api/jurusans/{id}/konsentrasi` — read-only (no write endpoint exists). */
  konsentrasi: (id: Id) =>
    api.get<Konsentrasi[]>(`/jurusans/${id}/konsentrasi`).then((r) => r.data),
}
