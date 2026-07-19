import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api, { setToken, clearToken, getToken } from '@/lib/api'
import type { Credentials, User } from '@/types'

/**
 * The single owner of auth state — replaces Blade `Auth` / `User::isAdmin()`.
 * Guards, `AppMenu`, and `AppTopbar` read from here.
 *
 * Auth is now **stateless JWT** (Spring Boot). `login` stores the bearer token
 * via `setToken` (see `@/lib/api`), which the request interceptor attaches to
 * every call; `logout` just drops the token client-side.
 */

/**
 * Response body of `POST /auth/login`. The `user` field is the Spring payload,
 * consumed as the app-wide {@link User} verbatim (no remapping).
 */
interface LoginResponse {
  token: string
  tokenType?: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  /** True once we've attempted an initial `fetchUser` (guards await this). */
  const initialized = ref(false)

  // Reactive getters derived from the authenticated user. `fetchUser` (gated on
  // a stored token) runs during `ensureInitialized` before guards read these,
  // so user-state is a sufficient and reactive source of truth.
  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.admin === true)
  // Legacy hardcoded stubs — replaced by the computed getters above.
  // const isAuthenticated = ref(true)
  // const isAdmin = ref(true)

  /** Fetch the current user via the JWT; null when there's no/invalid token. */
  async function fetchUser(): Promise<User | null> {
    // No token → not logged in; skip the call so we don't trip the 403 → login
    // redirect in the response interceptor (e.g. while sitting on /login).
    if (!getToken()) {
      user.value = null
      return null
    }
    try {
      const { data } = await api.get<User>('/auth/me')
      user.value = data
    } catch {
      user.value = null
    }
    return user.value
  }

  /** Idempotent boot hydration — call once before guards evaluate. */
  async function ensureInitialized(): Promise<void> {
    if (initialized.value) return
    await fetchUser()
    initialized.value = true
  }

  /** Login: POST /auth/login, store the JWT, then set the user state. */
  async function login(credentials: Credentials): Promise<void> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials)
    setToken(data.token)
    user.value = data.user
    initialized.value = true
  }

  /** Logout: JWT is stateless, so drop the token locally and go to /login. */
  async function logout(): Promise<void> {
    clearToken()
    clearSession()
    // Dynamic import breaks the router ↔ store init cycle.
    const { default: router } = await import('@/router')
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
  }

  /** Local-only teardown (also called by the 401/403 interceptor). */
  function clearSession(): void {
    user.value = null
  }

  return {
    user,
    initialized,
    isAuthenticated,
    isAdmin,
    fetchUser,
    ensureInitialized,
    login,
    logout,
    clearSession,
  }
})
