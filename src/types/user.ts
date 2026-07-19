import type { Id } from './common'

/**
 * Application user — mirrors the Spring Boot payload verbatim (`/auth/login`.user,
 * `/auth/me`, `/api/users`). `admin` drives admin route gating (the `isAdmin`
 * getter). No frontend remapping: the type follows the backend's shape exactly.
 */
export interface User {
  id: Id
  name: string
  email: string
  faculty?: string | null
  emailVerifiedAt?: string | null
  admin: boolean
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
