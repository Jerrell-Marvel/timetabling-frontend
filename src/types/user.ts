import type { Id } from './common'

/**
 * Application user. `is_admin` mirrors the legacy `User::isAdmin()` used by the
 * `isAdmin` middleware — it is the single source for admin route gating.
 */
export interface User {
  id: Id
  name: string
  email: string
  faculty?: string | null
  is_admin: boolean
}

/** Payload for `POST /login`. */
export interface Credentials {
  email: string
  password: string
  remember?: boolean
}

/** Admin create/update payload for `resource('users')`. Password optional on update. */
export interface UserPayload {
  name: string
  email: string
  password?: string
  faculty?: string | null
}
