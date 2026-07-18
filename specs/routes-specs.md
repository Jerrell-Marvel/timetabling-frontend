# Route Registration Specs — Vue 3 SPA

> Implementation spec for registering all 37 frontend routes into the new Vue 3 SPA.
> Based on [frontend-routes.md](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/frontend-routes.md).

> [!IMPORTANT]
> All view files created in Phases 2–6 are **stub/placeholder** components. Each will contain only a `<template>` with the page title and a `<script setup>` block. Actual page logic and UI will be implemented in separate tasks.

---

## Phase 1 — Router Foundation & Auth Infrastructure

**Goal:** Set up Vue Router, navigation guards, layout system, login page, and a catch-all 404 page. After this phase, the app should boot, show the login page for unauthenticated users, and redirect authenticated users to the dashboard.

**Routes registered:** 2 (Login, 404)

---

### [NEW] `src/router/index.ts`

The main router configuration file. Initially registers only the login route and a catch-all 404.

```ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Auth views
import LoginView from '@/views/auth/LoginView.vue'

// Error views
import NotFoundView from '@/views/errors/NotFoundView.vue'

const routes: RouteRecordRaw[] = [
  // --- Auth (Guest-only) ---
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

  // --- Catch-all 404 ---
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '404 — Halaman Tidak Ditemukan' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- Navigation Guards ---
router.beforeEach((to, from, next) => {
  const isAuthenticated = false // TODO: replace with auth store check
  const isAdmin = false // TODO: replace with auth store check

  // Guest-only routes (login) — redirect to home if already logged in
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'home' })
  }

  // Auth-required routes — redirect to login if not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Admin-required routes — redirect to home or show 403
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'home' }) // or a 403 page
  }

  next()
})

// --- Dynamic Page Title ---
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} — Timetabling`
    : 'Timetabling'
})

export default router
```

---

### [NEW] `src/router/guards.ts`

Extracted guard logic for reusability and testability.

```ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // const auth = useAuthStore()
  // if (!auth.isAuthenticated) {
  //   return next({ name: 'login', query: { redirect: to.fullPath } })
  // }
  next()
}

export function guestGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // const auth = useAuthStore()
  // if (auth.isAuthenticated) {
  //   return next({ name: 'home' })
  // }
  next()
}

export function adminGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // const auth = useAuthStore()
  // if (!auth.isAdmin) {
  //   return next({ name: 'home' })
  // }
  next()
}
```

---

### [NEW] `src/layouts/AuthLayout.vue`

Minimal layout for the login page (no sidebar, no topbar).

```vue
<template>
  <div class="auth-layout">
    <RouterView />
  </div>
</template>
```

---

### [NEW] `src/layouts/DefaultLayout.vue`

Main authenticated layout with sidebar navigation and topbar.

```vue
<template>
  <div class="default-layout">
    <aside class="sidebar">
      <!-- Sidebar navigation menu -->
    </aside>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
```

---

### [NEW] `src/views/auth/LoginView.vue`

Login page stub.

```vue
<template>
  <div class="login-view">
    <h1>Login</h1>
    <!-- Login form placeholder -->
  </div>
</template>

<script setup lang="ts">
// Login logic will be implemented later
</script>
```

---

### [NEW] `src/views/errors/NotFoundView.vue`

404 error page.

```vue
<template>
  <div class="not-found-view">
    <h1>404</h1>
    <p>Halaman tidak ditemukan.</p>
    <RouterLink :to="{ name: 'home' }">Kembali ke Beranda</RouterLink>
  </div>
</template>
```

---

### [MODIFY] `src/main.ts`

Register the router with the Vue app instance.

```diff
 import { createApp } from 'vue'
 import App from './App.vue'
+import router from './router'

 const app = createApp(App)
+app.use(router)
 app.mount('#app')
```

---

### [MODIFY] `src/App.vue`

Replace static content with `<RouterView />`.

```diff
 <template>
-  <div>Hello World</div>
+  <RouterView />
 </template>
```

---

### Phase 1 File Summary

| Action | File |
|--------|------|
| [NEW] | `src/router/index.ts` |
| [NEW] | `src/router/guards.ts` |
| [NEW] | `src/layouts/AuthLayout.vue` |
| [NEW] | `src/layouts/DefaultLayout.vue` |
| [NEW] | `src/views/auth/LoginView.vue` |
| [NEW] | `src/views/errors/NotFoundView.vue` |
| [MODIFY] | `src/main.ts` |
| [MODIFY] | `src/App.vue` |

**Verification:** Navigate to `/login` → shows login page. Navigate to any other route → redirected to `/login` (once auth guard is active). Navigate to `/nonexistent` → shows 404.

---

## Phase 2 — Dashboard & Home Route

**Goal:** Register the home/dashboard route under the `DefaultLayout`. After this phase, authenticated users land on the dashboard after login.

**Routes registered this phase:** 1 (total: 3)

---

### [MODIFY] `src/router/index.ts`

Add the authenticated route group with the dashboard route.

```diff
+import HomeView from '@/views/HomeView.vue'

 const routes: RouteRecordRaw[] = [
   // --- Auth (Guest-only) ---
   { ... },

+  // --- Authenticated Routes ---
+  {
+    path: '/',
+    component: DefaultLayout,
+    meta: { requiresAuth: true },
+    children: [
+      {
+        path: '',
+        name: 'home',
+        component: HomeView,
+        meta: { title: 'Dashboard' },
+      },
+    ],
+  },

   // --- Catch-all 404 ---
   { ... },
 ]
```

---

### [NEW] `src/views/HomeView.vue`

Dashboard stub.

```vue
<template>
  <div class="home-view">
    <h1>Dashboard</h1>
    <!-- Dashboard content placeholder -->
  </div>
</template>

<script setup lang="ts">
// Dashboard logic will be implemented later
</script>
```

---

### Phase 2 File Summary

| Action | File |
|--------|------|
| [MODIFY] | `src/router/index.ts` |
| [NEW] | `src/views/HomeView.vue` |

**Verification:** Navigate to `/` → shows dashboard (when authenticated). Login redirects to `/`.

---

## Phase 3 — Master Data Routes (Lecturers, Courses, Rooms)

**Goal:** Register all CRUD routes for the three Master Data modules. All routes require `Auth` guard only (no admin restriction).

**Routes registered this phase:** 12 (total: 15)

---

### [NEW] `src/router/modules/masterData.ts`

Extracted route module for Master Data group.

```ts
import type { RouteRecordRaw } from 'vue-router'

const LecturerIndexView = () => import('@/views/master-data/lecturers/LecturerIndexView.vue')
const LecturerFormView = () => import('@/views/master-data/lecturers/LecturerFormView.vue')
const LecturerShowView = () => import('@/views/master-data/lecturers/LecturerShowView.vue')

const CourseIndexView = () => import('@/views/master-data/courses/CourseIndexView.vue')
const CourseFormView = () => import('@/views/master-data/courses/CourseFormView.vue')
const CourseShowView = () => import('@/views/master-data/courses/CourseShowView.vue')

const RoomIndexView = () => import('@/views/master-data/rooms/RoomIndexView.vue')
const RoomFormView = () => import('@/views/master-data/rooms/RoomFormView.vue')
const RoomShowView = () => import('@/views/master-data/rooms/RoomShowView.vue')

export const masterDataRoutes: RouteRecordRaw[] = [
  // --- Lecturers (Pengajar) ---
  {
    path: 'lecturers',
    name: 'lecturers.index',
    component: LecturerIndexView,
    meta: { title: 'Pengajar' },
  },
  {
    path: 'lecturers/create',
    name: 'lecturers.create',
    component: LecturerFormView,
    meta: { title: 'Tambah Pengajar' },
  },
  {
    path: 'lecturers/:id',
    name: 'lecturers.show',
    component: LecturerShowView,
    meta: { title: 'Detail Pengajar' },
  },
  {
    path: 'lecturers/:id/edit',
    name: 'lecturers.edit',
    component: LecturerFormView,
    meta: { title: 'Edit Pengajar' },
  },

  // --- Courses (Matakuliah) ---
  {
    path: 'courses',
    name: 'courses.index',
    component: CourseIndexView,
    meta: { title: 'Matakuliah' },
  },
  {
    path: 'courses/create',
    name: 'courses.create',
    component: CourseFormView,
    meta: { title: 'Tambah Matakuliah' },
  },
  {
    path: 'courses/:id',
    name: 'courses.show',
    component: CourseShowView,
    meta: { title: 'Detail Matakuliah' },
  },
  {
    path: 'courses/:id/edit',
    name: 'courses.edit',
    component: CourseFormView,
    meta: { title: 'Edit Matakuliah' },
  },

  // --- Rooms (Ruangan) ---
  {
    path: 'rooms',
    name: 'rooms.index',
    component: RoomIndexView,
    meta: { title: 'Ruangan' },
  },
  {
    path: 'rooms/create',
    name: 'rooms.create',
    component: RoomFormView,
    meta: { title: 'Tambah Ruangan' },
  },
  {
    path: 'rooms/:id',
    name: 'rooms.show',
    component: RoomShowView,
    meta: { title: 'Detail Ruangan' },
  },
  {
    path: 'rooms/:id/edit',
    name: 'rooms.edit',
    component: RoomFormView,
    meta: { title: 'Edit Ruangan' },
  },
]
```

---

### [MODIFY] `src/router/index.ts`

Import and spread the master data routes into the authenticated group.

```diff
+import { masterDataRoutes } from './modules/masterData'

 // --- Authenticated Routes ---
 {
   path: '/',
   component: DefaultLayout,
   meta: { requiresAuth: true },
   children: [
     {
       path: '',
       name: 'home',
       component: HomeView,
       meta: { title: 'Dashboard' },
     },
+    ...masterDataRoutes,
   ],
 },
```

---

### [NEW] View Stubs (9 files)

| File | Component | Content |
|------|-----------|---------|
| `src/views/master-data/lecturers/LecturerIndexView.vue` | `<h1>Pengajar</h1>` | Index with DataTable placeholder |
| `src/views/master-data/lecturers/LecturerFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Pengajar</h1>` | Shared create/edit form |
| `src/views/master-data/lecturers/LecturerShowView.vue` | `<h1>Detail Pengajar</h1>` | Read-only detail view |
| `src/views/master-data/courses/CourseIndexView.vue` | `<h1>Matakuliah</h1>` | Index with DataTable placeholder |
| `src/views/master-data/courses/CourseFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Matakuliah</h1>` | Shared create/edit form |
| `src/views/master-data/courses/CourseShowView.vue` | `<h1>Detail Matakuliah</h1>` | Read-only detail view |
| `src/views/master-data/rooms/RoomIndexView.vue` | `<h1>Ruangan</h1>` | Index with DataTable placeholder |
| `src/views/master-data/rooms/RoomFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Ruangan</h1>` | Shared create/edit form |
| `src/views/master-data/rooms/RoomShowView.vue` | `<h1>Detail Ruangan</h1>` | Read-only detail view |

Each form view stub follows this pattern:

```vue
<template>
  <div>
    <h1>{{ isEdit ? 'Edit' : 'Tambah' }} Pengajar</h1>
    <!-- Form placeholder -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isEdit = computed(() => !!route.params.id)
</script>
```

---

### Phase 3 File Summary

| Action | File |
|--------|------|
| [NEW] | `src/router/modules/masterData.ts` |
| [MODIFY] | `src/router/index.ts` |
| [NEW] | `src/views/master-data/lecturers/LecturerIndexView.vue` |
| [NEW] | `src/views/master-data/lecturers/LecturerFormView.vue` |
| [NEW] | `src/views/master-data/lecturers/LecturerShowView.vue` |
| [NEW] | `src/views/master-data/courses/CourseIndexView.vue` |
| [NEW] | `src/views/master-data/courses/CourseFormView.vue` |
| [NEW] | `src/views/master-data/courses/CourseShowView.vue` |
| [NEW] | `src/views/master-data/rooms/RoomIndexView.vue` |
| [NEW] | `src/views/master-data/rooms/RoomFormView.vue` |
| [NEW] | `src/views/master-data/rooms/RoomShowView.vue` |

**Verification:** Navigate to `/lecturers`, `/courses`, `/rooms` and their `/create`, `/:id`, `/:id/edit` sub-routes → all render the correct stub component with the correct page title.

---

## Phase 4 — Scheduling Routes (Activities, Settings, Timetable, Results)

**Goal:** Register all scheduling-related routes. Activities and Settings require `Auth`. Timetable index requires `Auth + Admin`. Timetable show and Results require `Auth` only.

**Routes registered this phase:** 10 (total: 25)

---

### [NEW] `src/router/modules/scheduling.ts`

```ts
import type { RouteRecordRaw } from 'vue-router'

const ActivityIndexView = () => import('@/views/scheduling/activities/ActivityIndexView.vue')
const ActivityFormView = () => import('@/views/scheduling/activities/ActivityFormView.vue')
const ActivityShowView = () => import('@/views/scheduling/activities/ActivityShowView.vue')

const SettingIndexView = () => import('@/views/scheduling/settings/SettingIndexView.vue')
const SettingFormView = () => import('@/views/scheduling/settings/SettingFormView.vue')

const TimetableView = () => import('@/views/scheduling/timetable/TimetableView.vue')
const TimetableShowView = () => import('@/views/scheduling/timetable/TimetableShowView.vue')

const ResultIndexView = () => import('@/views/scheduling/results/ResultIndexView.vue')

export const schedulingRoutes: RouteRecordRaw[] = [
  // --- Activities (Input Aktivitas) ---
  {
    path: 'activities',
    name: 'activities.index',
    component: ActivityIndexView,
    meta: { title: 'Input Aktivitas' },
  },
  {
    path: 'activities/create',
    name: 'activities.create',
    component: ActivityFormView,
    meta: { title: 'Tambah Aktivitas' },
  },
  {
    path: 'activities/:id',
    name: 'activities.show',
    component: ActivityShowView,
    meta: { title: 'Detail Aktivitas' },
  },
  {
    path: 'activities/:id/edit',
    name: 'activities.edit',
    component: ActivityFormView,
    meta: { title: 'Edit Aktivitas' },
  },

  // --- Settings (Pengaturan Penjadwalan) ---
  {
    path: 'settings',
    name: 'settings.index',
    component: SettingIndexView,
    meta: { title: 'Pengaturan Penjadwalan' },
  },
  {
    path: 'settings/create',
    name: 'settings.create',
    component: SettingFormView,
    meta: { title: 'Tambah Pengaturan' },
  },
  {
    path: 'settings/:id/edit',
    name: 'settings.edit',
    component: SettingFormView,
    meta: { title: 'Edit Pengaturan' },
  },

  // --- Timetable (Penjadwalan) ---
  {
    path: 'timetable',
    name: 'timetable.index',
    component: TimetableView,
    meta: { title: 'Penjadwalan', requiresAdmin: true },
  },
  {
    path: 'timetable/:id',
    name: 'timetable.show',
    component: TimetableShowView,
    meta: { title: 'Lihat Jadwal' },
  },

  // --- Results (Hasil Penjadwalan) ---
  {
    path: 'results',
    name: 'results.index',
    component: ResultIndexView,
    meta: { title: 'Hasil Penjadwalan' },
  },
]
```

---

### [MODIFY] `src/router/index.ts`

Import and spread the scheduling routes into the authenticated group.

```diff
+import { schedulingRoutes } from './modules/scheduling'

 children: [
   { path: '', name: 'home', ... },
   ...masterDataRoutes,
+  ...schedulingRoutes,
 ],
```

---

### [NEW] View Stubs (8 files)

| File | Content |
|------|---------|
| `src/views/scheduling/activities/ActivityIndexView.vue` | `<h1>Input Aktivitas</h1>` |
| `src/views/scheduling/activities/ActivityFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Aktivitas</h1>` |
| `src/views/scheduling/activities/ActivityShowView.vue` | `<h1>Detail Aktivitas</h1>` |
| `src/views/scheduling/settings/SettingIndexView.vue` | `<h1>Pengaturan Penjadwalan</h1>` |
| `src/views/scheduling/settings/SettingFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Pengaturan</h1>` |
| `src/views/scheduling/timetable/TimetableView.vue` | `<h1>Penjadwalan</h1>` |
| `src/views/scheduling/timetable/TimetableShowView.vue` | `<h1>Lihat Jadwal</h1>` |
| `src/views/scheduling/results/ResultIndexView.vue` | `<h1>Hasil Penjadwalan</h1>` |

---

### Phase 4 File Summary

| Action | File |
|--------|------|
| [NEW] | `src/router/modules/scheduling.ts` |
| [MODIFY] | `src/router/index.ts` |
| [NEW] | `src/views/scheduling/activities/ActivityIndexView.vue` |
| [NEW] | `src/views/scheduling/activities/ActivityFormView.vue` |
| [NEW] | `src/views/scheduling/activities/ActivityShowView.vue` |
| [NEW] | `src/views/scheduling/settings/SettingIndexView.vue` |
| [NEW] | `src/views/scheduling/settings/SettingFormView.vue` |
| [NEW] | `src/views/scheduling/timetable/TimetableView.vue` |
| [NEW] | `src/views/scheduling/timetable/TimetableShowView.vue` |
| [NEW] | `src/views/scheduling/results/ResultIndexView.vue` |

**Verification:** Navigate to `/activities`, `/settings`, `/timetable`, `/results` and sub-routes. The `/timetable` route should only be accessible by admin users.

---

## Phase 5 — Pengaturan Routes (Semesters, Prodis, Room Types, Activity Types)

**Goal:** Register all admin settings routes. ALL routes in this phase require `Auth + Admin`.

**Routes registered this phase:** 10 (total: 35)

---

### [NEW] `src/router/modules/pengaturan.ts`

```ts
import type { RouteRecordRaw } from 'vue-router'

const SemesterIndexView = () => import('@/views/pengaturan/semesters/SemesterIndexView.vue')

const ProdiIndexView = () => import('@/views/pengaturan/prodis/ProdiIndexView.vue')
const ProdiFormView = () => import('@/views/pengaturan/prodis/ProdiFormView.vue')

const RoomTypeIndexView = () => import('@/views/pengaturan/room-types/RoomTypeIndexView.vue')
const RoomTypeFormView = () => import('@/views/pengaturan/room-types/RoomTypeFormView.vue')

const ActivityTypeIndexView = () => import('@/views/pengaturan/activity-types/ActivityTypeIndexView.vue')
const ActivityTypeFormView = () => import('@/views/pengaturan/activity-types/ActivityTypeFormView.vue')

export const pengaturanRoutes: RouteRecordRaw[] = [
  // --- Semesters ---
  {
    path: 'semesters',
    name: 'semesters.index',
    component: SemesterIndexView,
    meta: { title: 'Semester', requiresAdmin: true },
  },

  // --- Program Studi (Prodis) ---
  {
    path: 'prodis',
    name: 'prodis.index',
    component: ProdiIndexView,
    meta: { title: 'Program Studi', requiresAdmin: true },
  },
  {
    path: 'prodis/create',
    name: 'prodis.create',
    component: ProdiFormView,
    meta: { title: 'Tambah Program Studi', requiresAdmin: true },
  },
  {
    path: 'prodis/:id/edit',
    name: 'prodis.edit',
    component: ProdiFormView,
    meta: { title: 'Edit Program Studi', requiresAdmin: true },
  },

  // --- Room Types (Tipe Ruangan) ---
  {
    path: 'room-types',
    name: 'roomTypes.index',
    component: RoomTypeIndexView,
    meta: { title: 'Tipe Ruangan', requiresAdmin: true },
  },
  {
    path: 'room-types/create',
    name: 'roomTypes.create',
    component: RoomTypeFormView,
    meta: { title: 'Tambah Tipe Ruangan', requiresAdmin: true },
  },
  {
    path: 'room-types/:id/edit',
    name: 'roomTypes.edit',
    component: RoomTypeFormView,
    meta: { title: 'Edit Tipe Ruangan', requiresAdmin: true },
  },

  // --- Activity Types (Tipe Aktivitas) ---
  {
    path: 'activity-types',
    name: 'activityTypes.index',
    component: ActivityTypeIndexView,
    meta: { title: 'Tipe Aktivitas', requiresAdmin: true },
  },
  {
    path: 'activity-types/create',
    name: 'activityTypes.create',
    component: ActivityTypeFormView,
    meta: { title: 'Tambah Tipe Aktivitas', requiresAdmin: true },
  },
  {
    path: 'activity-types/:id/edit',
    name: 'activityTypes.edit',
    component: ActivityTypeFormView,
    meta: { title: 'Edit Tipe Aktivitas', requiresAdmin: true },
  },
]
```

---

### [MODIFY] `src/router/index.ts`

Import and spread the pengaturan routes into the authenticated group.

```diff
+import { pengaturanRoutes } from './modules/pengaturan'

 children: [
   { path: '', name: 'home', ... },
   ...masterDataRoutes,
   ...schedulingRoutes,
+  ...pengaturanRoutes,
 ],
```

---

### [NEW] View Stubs (7 files)

| File | Content |
|------|---------|
| `src/views/pengaturan/semesters/SemesterIndexView.vue` | `<h1>Semester</h1>` |
| `src/views/pengaturan/prodis/ProdiIndexView.vue` | `<h1>Program Studi</h1>` |
| `src/views/pengaturan/prodis/ProdiFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Program Studi</h1>` |
| `src/views/pengaturan/room-types/RoomTypeIndexView.vue` | `<h1>Tipe Ruangan</h1>` |
| `src/views/pengaturan/room-types/RoomTypeFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Tipe Ruangan</h1>` |
| `src/views/pengaturan/activity-types/ActivityTypeIndexView.vue` | `<h1>Tipe Aktivitas</h1>` |
| `src/views/pengaturan/activity-types/ActivityTypeFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Tipe Aktivitas</h1>` |

---

### Phase 5 File Summary

| Action | File |
|--------|------|
| [NEW] | `src/router/modules/pengaturan.ts` |
| [MODIFY] | `src/router/index.ts` |
| [NEW] | `src/views/pengaturan/semesters/SemesterIndexView.vue` |
| [NEW] | `src/views/pengaturan/prodis/ProdiIndexView.vue` |
| [NEW] | `src/views/pengaturan/prodis/ProdiFormView.vue` |
| [NEW] | `src/views/pengaturan/room-types/RoomTypeIndexView.vue` |
| [NEW] | `src/views/pengaturan/room-types/RoomTypeFormView.vue` |
| [NEW] | `src/views/pengaturan/activity-types/ActivityTypeIndexView.vue` |
| [NEW] | `src/views/pengaturan/activity-types/ActivityTypeFormView.vue` |

**Verification:** Navigate to `/semesters`, `/prodis`, `/room-types`, `/activity-types` and sub-routes. All should be blocked for non-admin users.

---

## Phase 6 — User Management Routes

**Goal:** Register user management CRUD routes. ALL routes require `Auth + Admin`.

**Routes registered this phase:** 3 (total: **37** ✓ — all routes registered)

---

### [NEW] `src/router/modules/userManagement.ts`

```ts
import type { RouteRecordRaw } from 'vue-router'

const UserIndexView = () => import('@/views/users/UserIndexView.vue')
const UserFormView = () => import('@/views/users/UserFormView.vue')

export const userManagementRoutes: RouteRecordRaw[] = [
  {
    path: 'users',
    name: 'users.index',
    component: UserIndexView,
    meta: { title: 'Pengguna', requiresAdmin: true },
  },
  {
    path: 'users/create',
    name: 'users.create',
    component: UserFormView,
    meta: { title: 'Tambah Pengguna', requiresAdmin: true },
  },
  {
    path: 'users/:id/edit',
    name: 'users.edit',
    component: UserFormView,
    meta: { title: 'Edit Pengguna', requiresAdmin: true },
  },
]
```

---

### [MODIFY] `src/router/index.ts`

Import and spread the user management routes into the authenticated group.

```diff
+import { userManagementRoutes } from './modules/userManagement'

 children: [
   { path: '', name: 'home', ... },
   ...masterDataRoutes,
   ...schedulingRoutes,
   ...pengaturanRoutes,
+  ...userManagementRoutes,
 ],
```

---

### [NEW] View Stubs (2 files)

| File | Content |
|------|---------|
| `src/views/users/UserIndexView.vue` | `<h1>Pengguna</h1>` |
| `src/views/users/UserFormView.vue` | `<h1>{{ isEdit ? 'Edit' : 'Tambah' }} Pengguna</h1>` |

---

### Phase 6 File Summary

| Action | File |
|--------|------|
| [NEW] | `src/router/modules/userManagement.ts` |
| [MODIFY] | `src/router/index.ts` |
| [NEW] | `src/views/users/UserIndexView.vue` |
| [NEW] | `src/views/users/UserFormView.vue` |

**Verification:** Navigate to `/users`, `/users/create`, `/users/:id/edit`. All should be blocked for non-admin users.

---

## Final State — Complete File Tree

After all 6 phases, the router-related file tree will be:

```
src/
├── App.vue                                           [MODIFIED Phase 1]
├── main.ts                                           [MODIFIED Phase 1]
├── router/
│   ├── index.ts                                      [NEW Phase 1, MODIFIED Phase 2–6]
│   ├── guards.ts                                     [NEW Phase 1]
│   └── modules/
│       ├── masterData.ts                             [NEW Phase 3]
│       ├── scheduling.ts                             [NEW Phase 4]
│       ├── pengaturan.ts                             [NEW Phase 5]
│       └── userManagement.ts                         [NEW Phase 6]
├── layouts/
│   ├── AuthLayout.vue                                [NEW Phase 1]
│   └── DefaultLayout.vue                             [NEW Phase 1]
└── views/
    ├── auth/
    │   └── LoginView.vue                             [NEW Phase 1]
    ├── errors/
    │   └── NotFoundView.vue                          [NEW Phase 1]
    ├── HomeView.vue                                  [NEW Phase 2]
    ├── scheduling/
    │   ├── activities/
    │   │   ├── ActivityIndexView.vue                 [NEW Phase 4]
    │   │   ├── ActivityFormView.vue                  [NEW Phase 4]
    │   │   └── ActivityShowView.vue                  [NEW Phase 4]
    │   ├── settings/
    │   │   ├── SettingIndexView.vue                  [NEW Phase 4]
    │   │   └── SettingFormView.vue                   [NEW Phase 4]
    │   ├── timetable/
    │   │   ├── TimetableView.vue                     [NEW Phase 4]
    │   │   └── TimetableShowView.vue                 [NEW Phase 4]
    │   └── results/
    │       └── ResultIndexView.vue                   [NEW Phase 4]
    ├── master-data/
    │   ├── lecturers/
    │   │   ├── LecturerIndexView.vue                [NEW Phase 3]
    │   │   ├── LecturerFormView.vue                 [NEW Phase 3]
    │   │   └── LecturerShowView.vue                 [NEW Phase 3]
    │   ├── courses/
    │   │   ├── CourseIndexView.vue                   [NEW Phase 3]
    │   │   ├── CourseFormView.vue                    [NEW Phase 3]
    │   │   └── CourseShowView.vue                    [NEW Phase 3]
    │   └── rooms/
    │       ├── RoomIndexView.vue                     [NEW Phase 3]
    │       ├── RoomFormView.vue                      [NEW Phase 3]
    │       └── RoomShowView.vue                      [NEW Phase 3]
    ├── pengaturan/
    │   ├── semesters/
    │   │   └── SemesterIndexView.vue                [NEW Phase 5]
    │   ├── prodis/
    │   │   ├── ProdiIndexView.vue                   [NEW Phase 5]
    │   │   └── ProdiFormView.vue                    [NEW Phase 5]
    │   ├── room-types/
    │   │   ├── RoomTypeIndexView.vue                [NEW Phase 5]
    │   │   └── RoomTypeFormView.vue                 [NEW Phase 5]
    │   └── activity-types/
    │       ├── ActivityTypeIndexView.vue             [NEW Phase 5]
    │       └── ActivityTypeFormView.vue              [NEW Phase 5]
    └── users/
        ├── UserIndexView.vue                         [NEW Phase 6]
        └── UserFormView.vue                          [NEW Phase 6]
```

---

## Final `src/router/index.ts` (After All Phases)

```ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Eagerly loaded views
import LoginView from '@/views/auth/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'

// Route modules (lazy-loaded)
import { masterDataRoutes } from './modules/masterData'
import { schedulingRoutes } from './modules/scheduling'
import { pengaturanRoutes } from './modules/pengaturan'
import { userManagementRoutes } from './modules/userManagement'

const routes: RouteRecordRaw[] = [
  // --- Auth (Guest-only) ---
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

  // --- Authenticated Routes ---
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: 'Dashboard' },
      },
      ...masterDataRoutes,
      ...schedulingRoutes,
      ...pengaturanRoutes,
      ...userManagementRoutes,
    ],
  },

  // --- Catch-all 404 ---
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '404 — Halaman Tidak Ditemukan' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- Navigation Guards ---
router.beforeEach((to, from, next) => {
  const isAuthenticated = false // TODO: replace with auth store (Pinia)
  const isAdmin = false // TODO: replace with auth store (Pinia)

  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'home' })
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'home' })
  }

  next()
})

// --- Dynamic Page Title ---
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} — Timetabling`
    : 'Timetabling'
})

export default router
```

---

## Summary Table — All Phases

| Phase | Description | Routes | New Files | Modified Files | Cumulative Routes |
|-------|-------------|--------|-----------|----------------|-------------------|
| 1 | Router Foundation & Auth | 2 | 6 | 2 | 2 |
| 2 | Dashboard | 1 | 1 | 1 | 3 |
| 3 | Master Data (Lecturers, Courses, Rooms) | 12 | 10 | 1 | 15 |
| 4 | Scheduling (Activities, Settings, Timetable, Results) | 10 | 9 | 1 | 25 |
| 5 | Pengaturan (Semesters, Prodis, Room Types, Activity Types) | 10 | 8 | 1 | 35 |
| 6 | User Management | 3 | 3 | 1 | **37** |
| **Total** | | **37** | **37 new** | **7 modifications** | |
