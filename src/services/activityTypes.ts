import { createResource } from './resource'
import type { ActivityType } from '@/types'

/**
 * `resource('activity-types')` — name-only CRUD (R4).
 *
 * The legacy route was camelCase (`Route::resource('activityTypes')`); this API
 * kebab-cases it like every other endpoint, so the base here is NOT the SPA
 * identifier `activityType`.
 */
export const activityTypesService = createResource<ActivityType>('activity-types')
