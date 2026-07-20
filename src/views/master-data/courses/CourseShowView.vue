<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import CourseDetail from '@/components/courses/CourseDetail.vue'
import { coursesService } from '@/services'
import type { Course } from '@/types'

const route = useRoute()
const router = useRouter()
const course = ref<Course | null>(null)

onMounted(async () => {
  // `CourseResponse` embeds `jurusan`, so the department name comes back with
  // the course itself — no follow-up request.
  course.value = await coursesService.get(Number(route.params.id))
})
</script>

<template>
  <CRUPage page="Matakuliah" type="Detil" url="/courses">
    <div class="flex justify-end mb-4">
      <Button
        label="Edit"
        icon="pi pi-pencil"
        @click="router.push({ name: 'courses.edit', params: { id: route.params.id } })"
      />
    </div>
    <CourseDetail v-if="course" :course="course" />
  </CRUPage>
</template>
