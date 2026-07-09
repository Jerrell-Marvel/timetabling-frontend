import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

/**
 * Redirects to home if the user is already authenticated.
 * Used on guest-only routes like /login.
 * TODO: Replace isAuthenticated with Pinia auth store check.
 */
export function guestGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const isAuthenticated = false // TODO: useAuthStore().isAuthenticated
  if (isAuthenticated) {
    return next({ name: 'home' })
  }
  next()
}

/**
 * Redirects to /login if the user is NOT authenticated.
 * Preserves the intended destination via `redirect` query param.
 * TODO: Replace isAuthenticated with Pinia auth store check.
 */
export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const isAuthenticated = false // TODO: useAuthStore().isAuthenticated
  if (!isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  next()
}

/**
 * Redirects to home if the user is NOT an admin.
 * Applied to routes that require Auth + Admin.
 * TODO: Replace isAdmin with Pinia auth store check.
 */
export function adminGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const isAdmin = false // TODO: useAuthStore().isAdmin
  if (!isAdmin) {
    return next({ name: 'home' })
  }
  next()
}
