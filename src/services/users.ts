import { createResource } from './resource'
import type { User, UserPayload } from '@/types'

/** `resource('users')` (admin-only). */
export const usersService = createResource<User, UserPayload>('users')
