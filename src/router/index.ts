import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayout,
      children: [
        {
          path: '/',
          name: 'dashboard',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/activities',
          name: 'activities',
          component: () => import('../views/penjadwalan/ActivitiesView.vue'),
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('../views/penjadwalan/SettingsView.vue'),
        },
        {
          path: '/timetable',
          name: 'timetable',
          component: () => import('../views/penjadwalan/TimeTableView.vue'),
        },
        {
          path: '/results',
          name: 'results',
          component: () => import('../views/penjadwalan/ResultsView.vue'),
        },

        // --- MASTER DATA ---
        {
          path: '/lecturers',
          name: 'lecturers',
          component: () => import('../views/master-data/LecturersView.vue'),
        },
        {
          path: '/courses',
          name: 'courses',
          component: () => import('../views/master-data/CoursesView.vue'),
        },
        {
          path: '/rooms',
          name: 'rooms',
          component: () => import('../views/master-data/RoomsView.vue'),
        },

        // --- PENGATURAN ---
        {
          path: '/semesters',
          name: 'semesters',
          component: () => import('../views/pengaturan/SemestersView.vue'),
        },
        {
          path: '/prodis',
          name: 'prodis',
          component: () => import('../views/pengaturan/ProdisView.vue'),
        },
        {
          path: '/roomTypes',
          name: 'roomTypes',
          component: () => import('../views/pengaturan/RoomTypesView.vue'),
        },
        {
          path: '/activityTypes',
          name: 'activityTypes',
          component: () => import('../views/pengaturan/ActivityTypesView.vue'),
        },

        // --- PENGGUNA ---
        {
          path: '/users',
          name: 'users',
          component: () => import('../views/UsersView.vue'),
        },
      ],
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
  ],
})

export default router
