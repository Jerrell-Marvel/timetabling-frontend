import type { RouteRecordRaw } from 'vue-router'

const SemesterIndexView = () =>
  import('@/views/pengaturan/semesters/SemesterIndexView.vue')

const JurusanIndexView = () =>
  import('@/views/pengaturan/jurusans/JurusanIndexView.vue')
const JurusanFormView = () =>
  import('@/views/pengaturan/jurusans/JurusanFormView.vue')

const RoomTypeIndexView = () =>
  import('@/views/pengaturan/room-types/RoomTypeIndexView.vue')
const RoomTypeFormView = () =>
  import('@/views/pengaturan/room-types/RoomTypeFormView.vue')

const ActivityTypeIndexView = () =>
  import('@/views/pengaturan/activity-types/ActivityTypeIndexView.vue')
const ActivityTypeFormView = () =>
  import('@/views/pengaturan/activity-types/ActivityTypeFormView.vue')

export const pengaturanRoutes: RouteRecordRaw[] = [
  // --- Semesters ---
  {
    path: 'semesters',
    name: 'semesters.index',
    component: SemesterIndexView,
    meta: { title: 'Semester', requiresAdmin: true },
  },

  // --- Jurusan ---
  {
    path: 'jurusans',
    name: 'jurusans.index',
    component: JurusanIndexView,
    meta: { title: 'Jurusan', requiresAdmin: true },
  },
  {
    path: 'jurusans/create',
    name: 'jurusans.create',
    component: JurusanFormView,
    meta: { title: 'Tambah Jurusan', requiresAdmin: true },
  },
  {
    path: 'jurusans/:id/edit',
    name: 'jurusans.edit',
    component: JurusanFormView,
    meta: { title: 'Edit Jurusan', requiresAdmin: true },
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
