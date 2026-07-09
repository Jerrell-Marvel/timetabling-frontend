import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Layouts
import AuthLayout from '@/layout/AuthLayout.vue'
import AppLayout from '@/layout/AppLayout.vue'

// Eagerly loaded (critical path)
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'

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
      {
        path: 'activities',
        name: 'activities.index',
        component: () => import('@/views/penjadwalan/ActivitiesView.vue'),
        meta: { title: 'Input Aktivitas' },
      },
      {
        path: 'settings',
        name: 'settings.index',
        component: () => import('@/views/penjadwalan/SettingsView.vue'),
        meta: { title: 'Pengaturan Penjadwalan' },
      },
      {
        path: 'timetable',
        name: 'timetable.index',
        component: () => import('@/views/penjadwalan/TimeTableView.vue'),
        meta: { title: 'Penjadwalan', requiresAdmin: true },
      },
      {
        path: 'results',
        name: 'results.index',
        component: () => import('@/views/penjadwalan/ResultsView.vue'),
        meta: { title: 'Hasil Penjadwalan' },
      },

      // ── Master Data ───────────────────────
      {
        path: 'lecturers',
        name: 'lecturers.index',
        component: () => import('@/views/master-data/LecturersView.vue'),
        meta: { title: 'Pengajar' },
      },
      {
        path: 'courses',
        name: 'courses.index',
        component: () => import('@/views/master-data/CoursesView.vue'),
        meta: { title: 'Matakuliah' },
      },
      {
        path: 'rooms',
        name: 'rooms.index',
        component: () => import('@/views/master-data/RoomsView.vue'),
        meta: { title: 'Ruangan' },
      },

      // ── Pengaturan ────────────────────────
      {
        path: 'semesters',
        name: 'semesters.index',
        component: () => import('@/views/pengaturan/SemestersView.vue'),
        meta: { title: 'Semester', requiresAdmin: true },
      },
      {
        path: 'prodis',
        name: 'prodis.index',
        component: () => import('@/views/pengaturan/ProdisView.vue'),
        meta: { title: 'Program Studi', requiresAdmin: true },
      },
      {
        path: 'room-types',
        name: 'roomTypes.index',
        component: () => import('@/views/pengaturan/RoomTypesView.vue'),
        meta: { title: 'Tipe Ruangan', requiresAdmin: true },
      },
      {
        path: 'activity-types',
        name: 'activityTypes.index',
        component: () => import('@/views/pengaturan/ActivityTypesView.vue'),
        meta: { title: 'Tipe Aktivitas', requiresAdmin: true },
      },

      // ── Pengguna ──────────────────────────
      {
        path: 'users',
        name: 'users.index',
        component: () => import('@/views/UsersView.vue'),
        meta: { title: 'Pengguna', requiresAdmin: true },
      },
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
  const isAuthenticated = false // e.g. useAuthStore().isAuthenticated
  const isAdmin = false // e.g. useAuthStore().isAdmin

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
