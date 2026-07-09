<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <i class="pi pi-box text-xl text-orange-600"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-surface-900">Tipe Ruangan</h1>
          <p class="text-surface-400 text-xs mt-0.5">Daftar tipe ruangan</p>
        </div>
      </div>
      <Button
        label="Tambah Tipe Ruangan"
        icon="pi pi-plus"
        @click="router.push({ name: 'roomTypes.create' })"
      />
    </div>

    <!-- Table placeholder -->
    <div class="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
      <div class="flex items-center justify-center h-48 text-surface-300">
        <div class="text-center">
          <i class="pi pi-table text-4xl mb-3 block"></i>
          <p class="text-sm">Data tabel Tipe Ruangan akan ditampilkan di sini</p>
        </div>
      </div>
    </div>
  </div>
</template>
