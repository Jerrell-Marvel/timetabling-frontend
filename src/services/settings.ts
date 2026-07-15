import { createResource } from './resource'
import type { Setting } from '@/types'

/** `resource('settings')`. */
export const settingsService = createResource<Setting>('settings')
