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
