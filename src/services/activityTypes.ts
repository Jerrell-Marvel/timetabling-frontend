import { createResource } from './resource'
import type { ActivityType } from '@/types'

/** `resource('activityTypes')` — name-only CRUD (R4). */
export const activityTypesService = createResource<ActivityType>('activityTypes')
