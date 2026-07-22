import type { RouteRecordRaw } from 'vue-router'

const ActivityIndexView = () =>
  import('@/views/scheduling/activities/ActivityIndexView.vue')
const ActivityFormView = () =>
  import('@/views/scheduling/activities/ActivityFormView.vue')
const ActivityShowView = () =>
  import('@/views/scheduling/activities/ActivityShowView.vue')

const SettingIndexView = () =>
  import('@/views/scheduling/settings/SettingIndexView.vue')
const SettingFormView = () =>
  import('@/views/scheduling/settings/SettingFormView.vue')

const TimetableView = () =>
  import('@/views/scheduling/timetable/TimetableView.vue')
const TimetableShowView = () =>
  import('@/views/scheduling/timetable/TimetableShowView.vue')

const ResultIndexView = () =>
  import('@/views/scheduling/results/ResultIndexView.vue')

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
  // Reads are open (the index above), but writes are `@PreAuthorize("hasRole('ADMIN')")`
  // server-side — without this guard a faculty user reaches the form and only discovers
  // that on submit. It also keeps the setting-detail faculty scoping safe: a non-admin
  // sees a narrowed selection, which must never be saved back.
  {
    path: 'settings/create',
    name: 'settings.create',
    component: SettingFormView,
    meta: { title: 'Tambah Pengaturan', requiresAdmin: true },
  },
  {
    path: 'settings/:id/edit',
    name: 'settings.edit',
    component: SettingFormView,
    meta: { title: 'Edit Pengaturan', requiresAdmin: true },
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
