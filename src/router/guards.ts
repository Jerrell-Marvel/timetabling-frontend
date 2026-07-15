import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Standalone per-route guard helpers, store-backed. The active router uses the
 * global `beforeEach` in `index.ts`; these are kept for per-route composition and
 * assume the store has been hydrated (`ensureInitialized`) by that global guard.
 */

/** Redirects to home if the user is already authenticated (guest-only routes). */
export async function guestGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore()
  await auth.ensureInitialized()
  if (auth.isAuthenticated) {
    return next({ name: 'home' })
  }
  next()
}

/** Redirects to /login if the user is NOT authenticated (preserves destination). */
export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore()
  await auth.ensureInitialized()
  if (!auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  next()
}

/** Redirects to home if the user is NOT an admin (Auth + Admin routes). */
export async function adminGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore()
  await auth.ensureInitialized()
  if (!auth.isAdmin) {
    return next({ name: 'home' })
  }
  next()
}
