<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLayout } from './composables/layout'
import { useAuthStore } from '@/stores/auth'

const { toggleMenu } = useLayout()
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const accountMenu = ref<InstanceType<typeof Menu> | null>(null)

async function logout() {
  await authStore.logout()
  router.push({ name: 'login' })
}

const accountItems = computed<MenuItem[]>(() => [
  {
    label: 'Keluar',
    icon: 'pi pi-sign-out',
    command: logout,
  },
])

function toggleAccountMenu(event: Event) {
  accountMenu.value?.toggle(event)
}
</script>

<template>
  <div
    class="fixed top-0 left-0 w-full h-16 bg-white shadow-sm flex items-center justify-between px-6 z-50"
  >
    <div class="flex items-center gap-4">
      <button
        @click="toggleMenu"
        class="p-2 rounded-full hover:bg-surface-100 transition-colors cursor-pointer text-surface-700"
      >
        <i class="pi pi-bars text-xl"></i>
      </button>

      <span class="text-xl font-bold text-emerald-600">JadwalApp</span>
    </div>

    <div class="flex items-center gap-3">
      <Button
        text
        class="text-surface-700"
        @click="toggleAccountMenu"
        aria-haspopup="true"
        aria-controls="account_menu"
      >
        <i class="pi pi-user-circle text-xl"></i>
        <span class="hidden sm:inline">{{ user?.name ?? 'Akun' }}</span>
        <i class="pi pi-chevron-down text-xs"></i>
      </Button>
      <Menu id="account_menu" ref="accountMenu" :model="accountItems" :popup="true" />
    </div>
  </div>
</template>
