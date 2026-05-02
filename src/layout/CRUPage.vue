<script setup lang="ts">
import { computed } from 'vue'
// Pastikan path import ini sesuai dengan lokasi komponen Breadcrumb Anda
import BreadCrumb from './BreadCrumb.vue'

// 1. Mendefinisikan Props dengan TypeScript yang ketat
const props = defineProps<{
  page: string
  type: 'Buat' | 'Ubah' | 'Detil' // Hanya menerima 3 string ini
  url: string
}>()

// 2. Computed untuk menyusun data Breadcrumb secara otomatis
const breadcrumbItems = computed(() => [
  { name: props.page, url: props.url },
  { name: props.type }, // Item terakhir otomatis pasif berkat komponen Breadcrumb kita
])

// 3. Computed untuk menentukan Ikon Header secara dinamis
const headerIcon = computed(() => {
  if (props.type === 'Buat') return 'pi pi-plus-circle'
  if (props.type === 'Ubah') return 'pi pi-pencil'
  if (props.type === 'Detil') return 'pi pi-eye'
  return 'pi pi-file' // Ikon default jaga-jaga
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Breadcrumb Component -->
    <BreadCrumb :items="breadcrumbItems" />

    <!-- Container Utama -->
    <div class="w-full">
      <!-- Slot Khusus Error (Menggantikan blade_error) -->
      <!-- Di Vue, Anda bisa memasukkan komponen <Message> PrimeVue di slot ini -->
      <slot name="error"></slot>

      <!-- Card (Pengganti .card Bootstrap) -->
      <div class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
        <!-- Card Header (Pengganti .card-header Bootstrap) -->
        <!-- Flexbox untuk memisahkan Judul (Kiri) dan Tombol (Kanan) -->
        <div
          class="flex items-center justify-between p-4 border-b border-surface-200 bg-surface-50"
        >
          <!-- Judul & Ikon -->
          <div class="flex items-center gap-2 text-lg font-semibold text-surface-900">
            <i :class="headerIcon" class="text-emerald-600 text-xl"></i>
            <span>{{ type }} {{ page }}</span>
          </div>

          <!-- Tombol Kembali (Pengganti .btn .btn-light) -->
          <router-link :to="url" class="group">
            <button
              class="flex items-center gap-2 px-4 py-2 bg-white border border-surface-300 hover:bg-surface-100 text-surface-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i
                class="pi pi-arrow-left text-xs group-hover:-translate-x-1 transition-transform"
              ></i>
              Kembali
            </button>
          </router-link>
        </div>

        <!-- Card Body (Pengganti .card-body Bootstrap) -->
        <div class="p-5 sm:p-6">
          <!-- Slot Default untuk konten Form/Detail dari halaman anak -->
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
