import type { Id } from './common'

/**
 * Name-only reference entity (`activity_types`). Maps 1:1 to the same backend
 * structure as {@link RoomType}; per R4 the SPA identifier is `activityType`
 * (the legacy `roomType` prop was a copy-paste artifact).
 */
export interface ActivityType {
  id?: Id
  name: string
}
