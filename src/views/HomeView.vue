<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface QuickLink {
  label: string
  description: string
  icon: string
  to: string
  iconBg: string
  iconColor: string
}

interface Section {
  group: string
  links: QuickLink[]
}

const sections: Section[] = [
  {
    group: 'Penjadwalan',
    links: [
      {
        label: 'Input Aktivitas',
        description: 'Kelola daftar aktivitas perkuliahan',
        icon: 'pi pi-briefcase',
        to: '/activities',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Pengaturan Penjadwalan',
        description: 'Konfigurasi parameter penjadwalan',
        icon: 'pi pi-sliders-h',
        to: '/settings',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
      },
      {
        label: 'Penjadwalan',
        description: 'Jalankan algoritma penjadwalan',
        icon: 'pi pi-clock',
        to: '/timetable',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
      },
      {
        label: 'Hasil Penjadwalan',
        description: 'Lihat dan ekspor hasil jadwal',
        icon: 'pi pi-file-check',
        to: '/results',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      },
    ],
  },
  {
    group: 'Master Data',
    links: [
      {
        label: 'Pengajar',
        description: 'Data dosen dan ketersediaan waktu',
        icon: 'pi pi-users',
        to: '/lecturers',
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
      },
      {
        label: 'Matakuliah',
        description: 'Data matakuliah dan program studi',
        icon: 'pi pi-book',
        to: '/courses',
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
      },
      {
        label: 'Ruangan',
        description: 'Data ruang kelas dan kapasitas',
        icon: 'pi pi-building',
        to: '/rooms',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
      },
    ],
  },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <i class="pi pi-home text-2xl text-emerald-600"></i>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p class="text-surface-500 text-sm mt-0.5">Selamat datang di Sistem Penjadwalan</p>
      </div>
    </div>

    <!-- Quick-access sections -->
    <div v-for="section in sections" :key="section.group" class="space-y-3">
      <!-- Section label -->
      <h2 class="text-xs font-semibold uppercase tracking-widest text-surface-400 px-1">
        {{ section.group }}
      </h2>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="link in section.links"
          :key="link.to"
          class="group text-left bg-white rounded-2xl border border-surface-100 p-5 shadow-sm hover:shadow-md hover:border-surface-200 transition-all duration-200 cursor-pointer"
          @click="router.push(link.to)"
        >
          <!-- Icon -->
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
            :class="[link.iconBg]"
          >
            <i :class="[link.icon, link.iconColor, 'text-xl']"></i>
          </div>

          <!-- Text -->
          <p class="font-semibold text-surface-800 text-sm leading-snug mb-1">
            {{ link.label }}
          </p>
          <p class="text-surface-400 text-xs leading-relaxed">
            {{ link.description }}
          </p>

          <!-- Arrow -->
          <div class="mt-4 flex items-center gap-1 text-xs font-medium text-surface-400 group-hover:text-surface-600 transition-colors">
            <span>Buka</span>
            <i class="pi pi-arrow-right text-[10px] transition-transform duration-200 group-hover:translate-x-1"></i>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
