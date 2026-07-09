import type { RouteRecordRaw } from 'vue-router'

// ── Lecturers (Pengajar) ─────────────────────────────────────────
const LecturerIndexView = () =>
  import('@/views/master-data/lecturers/LecturerIndexView.vue')
const LecturerFormView = () =>
  import('@/views/master-data/lecturers/LecturerFormView.vue')
const LecturerShowView = () =>
  import('@/views/master-data/lecturers/LecturerShowView.vue')

// ── Courses (Matakuliah) ─────────────────────────────────────────
const CourseIndexView = () =>
  import('@/views/master-data/courses/CourseIndexView.vue')
const CourseFormView = () =>
  import('@/views/master-data/courses/CourseFormView.vue')
const CourseShowView = () =>
  import('@/views/master-data/courses/CourseShowView.vue')

// ── Rooms (Ruangan) ──────────────────────────────────────────────
const RoomIndexView = () =>
  import('@/views/master-data/rooms/RoomIndexView.vue')
const RoomFormView = () =>
  import('@/views/master-data/rooms/RoomFormView.vue')
const RoomShowView = () =>
  import('@/views/master-data/rooms/RoomShowView.vue')

export const masterDataRoutes: RouteRecordRaw[] = [
  // ── Lecturers ─────────────────────────────
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

  // ── Courses ───────────────────────────────
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

  // ── Rooms ─────────────────────────────────
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
