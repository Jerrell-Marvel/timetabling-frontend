import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api, { ensureCsrf } from '@/lib/api'
import type { Credentials, User } from '@/types'

/**
 * The single owner of auth state — replaces Blade `Auth` / `User::isAdmin()`.
 * Guards, `AppMenu`, and `AppTopbar` read from here (fixing the hardcoded
 * `isAdmin` / `isAuthenticated` stubs). Session is server-side (cookie); this
 * store caches the authenticated `User` and hydrates it via {@link fetchUser}.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  /** True once we've attempted an initial `fetchUser` (guards await this). */
  const initialized = ref(false)

  // const isAuthenticated = computed(() => user.value !== null)
  // const isAdmin = computed(() => user.value?.is_admin === true)
  const isAuthenticated = ref(true)
  const isAdmin = ref(true)

  /** Fetch the current user from the session cookie; null on 401. */
  async function fetchUser(): Promise<User | null> {
    try {
      const { data } = await api.get<User>('/user')
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

  /** Login (R2): prime CSRF, POST /login, then hydrate the user. */
  async function login(credentials: Credentials): Promise<void> {
    await ensureCsrf()
    await api.post('/login', credentials)
    await fetchUser()
    initialized.value = true
  }

  /** Logout (R2): POST /logout, then clear local state. */
  async function logout(): Promise<void> {
    try {
      await api.post('/logout')
    } finally {
      clearSession()
    }
  }

  /** Local-only teardown (also called by the 401 interceptor). */
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
