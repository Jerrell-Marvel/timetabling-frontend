<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 1. Import komponen CRUPage yang baru saja dibuat
import CRUPage from '../../layout/CRUPage.vue'
import { Button } from 'primevue'

const router = useRouter()

// State untuk form data pengajar
const form = ref({
  nip: '',
  name: '',
  email: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('') // State untuk simulasi error

const handleSave = () => {
  isSubmitting.value = true
  errorMessage.value = ''

  // Simulasi pengiriman data ke API
  setTimeout(() => {
    // Anggap saja ini skenario jika terjadi error dari server
    if (!form.value.nip || !form.value.name) {
      errorMessage.value = 'NIP dan Nama Dosen wajib diisi!'
      isSubmitting.value = false
      return
    }

    // Jika sukses, kembali ke halaman daftar pengajar
    alert('Data berhasil disimpan!')
    router.push('/lecturers')
  }, 1000)
}
</script>

<template>
  <!-- <div class="about">
    <h1 class="text-5xl">Activites Page ss</h1>
  </div> -->

  <!-- 2. Panggil CRUPage dan isi Props-nya -->
  <!-- type harus sesuai dengan yang kita daftarkan ('Buat', 'Ubah', atau 'Detil') -->
  <!-- url adalah rute kembali saat tombol "Kembali" diklik -->
  <CRUPage page="Data Pengajar" type="Ubah" url="/lecturers">
    <!-- 3. Mengisi Slot Error (opsional) -->
    <template #error>
      <div
        v-if="errorMessage"
        class="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle"></i>
          <strong>Gagal Menyimpan Data</strong>
        </div>
        <p class="mt-1 text-sm">{{ errorMessage }}</p>
      </div>
    </template>

    <!-- 4. Mengisi Slot Default (Konten Form) -->
    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Input NIP -->
      <div class="flex flex-col gap-2">
        <label for="nip" class="font-medium text-surface-700"
          >NIP <span class="text-red-500">*</span></label
        >
        <!-- Menggunakan InputText PrimeVue yang sudah auto-import -->
        <InputText
          id="nip"
          v-model="form.nip"
          placeholder="Masukkan Nomor Induk Pegawai"
          class="w-full md:w-1/2"
        />
      </div>

      <!-- Input Nama -->
      <div class="flex flex-col gap-2">
        <label for="name" class="font-medium text-surface-700"
          >Nama Lengkap <span class="text-red-500">*</span></label
        >
        <InputText
          id="name"
          v-model="form.name"
          placeholder="Misal: Dr. Budi Santoso, M.Kom"
          class="w-full md:w-1/2"
        />
      </div>

      <!-- Input Email -->
      <div class="flex flex-col gap-2">
        <label for="email" class="font-medium text-surface-700">Email Kampus</label>
        <InputText
          id="email"
          type="email"
          v-model="form.email"
          placeholder="budi@kampus.ac.id"
          class="w-full md:w-1/2"
        />
      </div>

      <!-- Pemisah -->
      <hr class="border-t border-surface-200 my-6" />

      <!-- Tombol Aksi -->
      <div class="flex justify-end gap-3">
        <router-link to="/lecturers">
          <Button type="button" label="Batal" severity="secondary" outlined />
        </router-link>
        <Button type="submit" label="Simpan Data" icon="pi pi-save" :loading="isSubmitting" />
      </div>
    </form>
  </CRUPage>
</template>
