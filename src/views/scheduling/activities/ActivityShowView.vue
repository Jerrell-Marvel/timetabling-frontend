<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          @click="router.push({ name: 'activities.index' })"
        />
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <i class="pi pi-briefcase text-xl text-blue-600"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-surface-900">Detail Aktivitas</h1>
            <p class="text-surface-400 text-xs mt-0.5">ID: {{ route.params.id }}</p>
          </div>
        </div>
      </div>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        @click="router.push({ name: 'activities.edit', params: { id: route.params.id } })"
      />
    </div>

    <!-- Detail placeholder -->
    <div class="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
      <div class="flex items-center justify-center h-48 text-surface-300">
        <div class="text-center">
          <i class="pi pi-id-card text-4xl mb-3 block"></i>
          <p class="text-sm">Detail Aktivitas akan ditampilkan di sini</p>
        </div>
      </div>
    </div>
  </div>
</template>
