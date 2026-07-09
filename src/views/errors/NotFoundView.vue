<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
    <div class="max-w-md w-full text-center bg-white p-10 rounded-2xl shadow-lg border border-surface-100">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
        <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
      </div>

      <!-- Error code -->
      <h1 class="text-7xl font-extrabold text-surface-900 mb-2">404</h1>
      <h2 class="text-xl font-semibold text-surface-700 mb-3">Halaman Tidak Ditemukan</h2>
      <p class="text-surface-500 mb-8">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          label="Kembali"
          icon="pi pi-arrow-left"
          severity="secondary"
          @click="router.back()"
        />
        <Button
          label="Ke Beranda"
          icon="pi pi-home"
          @click="router.push({ name: 'home' })"
        />
      </div>
    </div>
  </div>
</template>
