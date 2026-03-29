<script setup lang="ts">
import { ref } from 'vue'
import AppMenuItem, { MenuItemType } from './AppMenuItem.vue'

const model = ref<MenuItemType[]>([
  {
    label: 'Penjadwalan',
    items: [
      { label: 'Input Aktivitas', icon: 'pi pi-fw pi-briefcase', to: '/activities' },
      { label: 'Pengaturan Penjadwalan', icon: 'pi pi-fw pi-sliders-h', to: '/settings' },
      { label: 'Penjadwalan', icon: 'pi pi-fw pi-clock', to: '/timetable' },
      { label: 'Hasil Penjadwalan', icon: 'pi pi-fw pi-file-check', to: '/results' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Pengajar', icon: 'pi pi-fw pi-users', to: '/lecturers' },
      { label: 'Matakuliah', icon: 'pi pi-fw pi-book', to: '/courses' },
      { label: 'Ruangan', icon: 'pi pi-fw pi-building', to: '/rooms' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { label: 'Semester', icon: 'pi pi-fw pi-calendar', to: '/semesters' },
      { label: 'Program Studi', icon: 'pi pi-fw pi-sitemap', to: '/prodis' },
      { label: 'Tipe Ruangan', icon: 'pi pi-fw pi-box', to: '/roomTypes' },
      { label: 'Tipe Aktivitas', icon: 'pi pi-fw pi-tags', to: '/activityTypes' },
    ],
  },
  {
    label: 'Pengguna',
    icon: 'pi pi-fw pi-user',
    to: '/users',
  },
])
</script>

<template>
  <ul class="list-none p-0 m-0">
    <template v-for="(item, i) in model" :key="item.label">
      <AppMenuItem :item="item" :index="i" :root="true" />
      <li v-if="i !== model.length - 1" class="border-t border-surface-200 my-4"></li>
    </template>
  </ul>
</template>
