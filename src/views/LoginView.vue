<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = () => {
  // Validasi sederhana
  if (!email.value || !password.value) {
    alert('Email dan Password wajib diisi!')
    return
  }

  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false

    router.push('/')
  }, 1500)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-surface-100">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4"
        >
          <i class="pi pi-calendar text-3xl text-emerald-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-surface-900">Sistem Penjadwalan</h2>
        <p class="text-surface-500 mt-2">Silakan login ke akun Anda</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-surface-700 mb-2">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@unpar.ac.id"
            class="w-full"
            autocomplete="email"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-surface-700 mb-2"
            >Password</label
          >
          <Password
            id="password"
            v-model="password"
            placeholder="Masukkan password"
            :feedback="false"
            toggleMask
            class="w-full"
            inputClass="w-full"
          />
        </div>

        <div>
          <Button
            type="submit"
            label="Masuk"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="isLoading"
          />
        </div>
      </form>
    </div>
  </div>
</template>
