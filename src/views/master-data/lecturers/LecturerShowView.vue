<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import LecturerDetail from '@/components/lecturers/LecturerDetail.vue'
import { lecturersService } from '@/services'
import type { Lecturer } from '@/types'

const route = useRoute()
const router = useRouter()
const lecturer = ref<Lecturer | null>(null)

onMounted(async () => {
  lecturer.value = await lecturersService.get(Number(route.params.id))
})
</script>

<template>
  <CRUPage page="Pengajar" type="Detil" url="/lecturers">
    <div class="flex justify-end mb-4">
      <Button
        label="Edit"
        icon="pi pi-pencil"
        @click="router.push({ name: 'lecturers.edit', params: { id: route.params.id } })"
      />
    </div>
    <LecturerDetail v-if="lecturer" :lecturer="lecturer" />
  </CRUPage>
</template>
