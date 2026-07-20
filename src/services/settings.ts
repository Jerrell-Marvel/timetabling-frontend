import api from '@/lib/api'
import { createResource } from './resource'
import type { Id, Setting, SettingDetail, SettingPayload } from '@/types'

const resource = createResource<Setting, SettingPayload>('settings')

/**
 * `/api/settings` (`SettingController`). Create/update/delete are
 * `@PreAuthorize("hasRole('ADMIN')")`.
 */
export const settingsService = {
  ...resource,

  /**
   * `GET /api/settings/{id}` returns `SettingDetailResponse` — the richer shape
   * carrying the constraints map, unlike the list rows.
   */
  get: (id: Id) => api.get<SettingDetail>(`/settings/${id}`).then((r) => r.data),
}
