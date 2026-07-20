<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppMenuItem from './AppMenuItem.vue'
import type { MenuItemType } from './AppMenuItem.vue'
import { useAuthStore } from '@/stores/auth'

const { isAdmin } = storeToRefs(useAuthStore())

// Kalau ada children, maka parent tidak perlu memiliki adminRequired
const menus = ref<MenuItemType[]>([
  {
    label: 'Penjadwalan',
    items: [
      {
        label: 'Input Aktivitas',
        icon: 'pi pi-fw pi-briefcase',
        to: '/activities',
        adminRequired: false,
      },
      {
        label: 'Pengaturan Penjadwalan',
        icon: 'pi pi-fw pi-sliders-h',
        to: '/settings',
        adminRequired: false,
      },
      { label: 'Penjadwalan', icon: 'pi pi-fw pi-clock', to: '/timetable', adminRequired: true },
      {
        label: 'Hasil Penjadwalan',
        icon: 'pi pi-fw pi-file-check',
        to: '/results',
        adminRequired: false,
      },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Pengajar', icon: 'pi pi-fw pi-users', to: '/lecturers', adminRequired: false },
      { label: 'Matakuliah', icon: 'pi pi-fw pi-book', to: '/courses', adminRequired: false },
      { label: 'Ruangan', icon: 'pi pi-fw pi-building', to: '/rooms', adminRequired: false },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { label: 'Semester', icon: 'pi pi-fw pi-calendar', to: '/semesters', adminRequired: true },
      { label: 'Jurusan', icon: 'pi pi-fw pi-sitemap', to: '/jurusans', adminRequired: true },
      { label: 'Tipe Ruangan', icon: 'pi pi-fw pi-box', to: '/room-types', adminRequired: true },
      {
        label: 'Tipe Aktivitas',
        icon: 'pi pi-fw pi-tags',
        to: '/activity-types',
        adminRequired: true,
      },
    ],
  },
  { label: 'Pengguna', icon: 'pi pi-fw pi-user', to: '/users', adminRequired: true },
])

const filteredmenus = computed(() => {
  const filterItems = (items: MenuItemType[]): MenuItemType[] => {
    const result: MenuItemType[] = []

    for (const item of items) {
      // Kalau punya items
      if (item.items) {
        // Filter dulu childrennya
        const filteredChildren = filterItems(item.items)

        // Kalau childrennya masih ada, maka parentnya juga akan ikut tampil
        if (filteredChildren.length > 0) {
          result.push({ ...item, items: filteredChildren })
        }
      } else {
        if (!item.adminRequired || isAdmin.value) {
          // Kalau dia admin atau adminRequired false, maka akan tampil
          result.push(item)
        }
      }
    }

    return result
  }

  return filterItems(menus.value)
})
</script>

<template>
  <ul class="list-none p-0 m-0">
    <template v-for="(item, i) in filteredmenus" :key="item.label">
      <AppMenuItem :item="item" :index="i" :root="true" />
      <li v-if="i !== filteredmenus.length - 1" class="border-t border-surface-200 my-4"></li>
    </template>
  </ul>
</template>
