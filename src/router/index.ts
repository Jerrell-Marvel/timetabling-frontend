import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Layouts
import AuthLayout from '@/layout/AuthLayout.vue'
import AppLayout from '@/layout/AppLayout.vue'

// Eagerly loaded (critical path)
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'

// Route modules
import { masterDataRoutes } from './modules/masterData'
import { schedulingRoutes } from './modules/scheduling'
import { pengaturanRoutes } from './modules/pengaturan'
import { userManagementRoutes } from './modules/userManagement'

// ─────────────────────────────────────────────
// Route definitions
// ─────────────────────────────────────────────
const routes: RouteRecordRaw[] = [
  // ── Guest-only ────────────────────────────
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: LoginView,
        meta: { title: 'Login', requiresGuest: true },
      },
    ],
  },

  // ── Authenticated (DefaultLayout) ─────────
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      // Dashboard
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Dashboard' },
      },

      // ── Penjadwalan ───────────────────────
      ...schedulingRoutes,

      // ── Master Data ───────────────────────
      ...masterDataRoutes,

      // ── Pengaturan ────────────────────────
      ...pengaturanRoutes,

      // ── Pengguna ──────────────────────────
      ...userManagementRoutes,
    ],
  },

  // ── 404 Catch-all ─────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '404 — Halaman Tidak Ditemukan' },
  },
]

// ─────────────────────────────────────────────
// Router instance
// ─────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ─────────────────────────────────────────────
// Navigation guards
// ─────────────────────────────────────────────
router.beforeEach((to, _from, next) => {
  // TODO: Replace these stubs with Pinia auth store once auth is implemented.
  const isAuthenticated = true // e.g. useAuthStore().isAuthenticated
  const isAdmin = true // e.g. useAuthStore().isAdmin

  // Guest-only routes (e.g. /login) — redirect authenticated users to home
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'home' })
  }

  // Auth-required routes — redirect unauthenticated users to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Admin-required routes — redirect non-admin users to home
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'home' })
  }

  next()
})

// ─────────────────────────────────────────────
// Dynamic page title
// ─────────────────────────────────────────────
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} — Timetabling`
    : 'Timetabling'
})

export default router
