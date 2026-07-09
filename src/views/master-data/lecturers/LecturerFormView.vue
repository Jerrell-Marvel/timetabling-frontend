<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? 'Edit Pengajar' : 'Tambah Pengajar'))
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        @click="router.push({ name: 'lecturers.index' })"
      />
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
          <i class="pi pi-user-edit text-xl text-sky-600"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-surface-900">{{ pageTitle }}</h1>
          <p class="text-surface-400 text-xs mt-0.5">
            {{ isEdit ? `ID: ${route.params.id}` : 'Isi data pengajar baru' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Form placeholder -->
    <div class="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
      <div class="flex items-center justify-center h-48 text-surface-300">
        <div class="text-center">
          <i class="pi pi-file-edit text-4xl mb-3 block"></i>
          <p class="text-sm">Form {{ pageTitle }} akan ditampilkan di sini</p>
        </div>
      </div>
    </div>
  </div>
</template>
