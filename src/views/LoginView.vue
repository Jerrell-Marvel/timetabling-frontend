<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/lib/api'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const isLoading = ref(false)
// Legacy behavior: one top-level flash for invalid credentials, not field errors.
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Email dan Password wajib diisi.'
    return
  }

  isLoading.value = true
  try {
    await auth.login({ email: email.value, password: password.value, remember: remember.value })
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' && redirect ? redirect : { name: 'home' })
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Email atau password salah.')
  } finally {
    isLoading.value = false
  }
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
        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <div>
          <label for="email" class="block text-sm font-medium text-surface-700 mb-2"
            >Email<span class="text-red-500 ml-1">*</span></label
          >
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
            >Password<span class="text-red-500 ml-1">*</span></label
          >
          <Password
            id="password"
            v-model="password"
            placeholder="Masukkan password"
            :feedback="false"
            toggleMask
            class="w-full"
            inputClass="w-full"
            autocomplete="current-password"
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="remember" inputId="remember" binary />
          <label for="remember" class="text-sm text-surface-700">Ingat saya</label>
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
