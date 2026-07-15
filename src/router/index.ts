import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
        meta: { title: 'Beranda' },
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
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  // Hydrate the session once (from the cookie) before evaluating access.
  await auth.ensureInitialized()

  // Guest-only routes (e.g. /login) — redirect authenticated users to home
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return { name: 'home' }
  }

  // Auth-required routes — redirect unauthenticated users to login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Admin-required routes — redirect non-admin users to home
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  return true
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
