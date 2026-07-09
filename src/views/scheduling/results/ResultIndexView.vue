<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <i class="pi pi-file-check text-xl text-emerald-600"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-surface-900">Hasil Penjadwalan</h1>
          <p class="text-surface-400 text-xs mt-0.5">Lihat dan ekspor hasil jadwal</p>
        </div>
      </div>
      <Button
        label="Ekspor Hasil"
        icon="pi pi-download"
        severity="success"
      />
    </div>

    <!-- Table placeholder -->
    <div class="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
      <div class="flex items-center justify-center h-48 text-surface-300">
        <div class="text-center">
          <i class="pi pi-table text-4xl mb-3 block"></i>
          <p class="text-sm">Data tabel Hasil Penjadwalan akan ditampilkan di sini</p>
        </div>
      </div>
    </div>
  </div>
</template>
