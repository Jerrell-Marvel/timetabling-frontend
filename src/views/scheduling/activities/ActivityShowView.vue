<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import ActivityDetail from '@/components/activities/ActivityDetail.vue'
import {
  activitiesService,
  coursesService,
  lecturersService,
  roomsService,
  roomTypesService,
  semestersService,
} from '@/services'
import type { Activity } from '@/types'

const route = useRoute()
const router = useRouter()
const activity = ref<Activity | null>(null)
const courseName = ref<string>()
const semesterName = ref<string>()
const roomNames = ref<string[]>()
const roomTypeNames = ref<string[]>()
const lecturerNames = ref<string[]>()

onMounted(async () => {
  const data = await activitiesService.get(Number(route.params.id))
  activity.value = data

  const [course, semester, rooms, roomTypes, lecturers] = await Promise.all([
    coursesService.get(data.course_id),
    semestersService.get(data.semester_id),
    roomsService.list(),
    roomTypesService.list(),
    lecturersService.list(),
  ])
  courseName.value = course.name
  semesterName.value = semester.name
  roomNames.value = rooms.filter((r) => data.room_ids.includes(r.id!)).map((r) => r.code)
  roomTypeNames.value = roomTypes
    .filter((rt) => data.room_type_ids.includes(rt.id!))
    .map((rt) => rt.name)
  lecturerNames.value = lecturers
    .filter((l) => data.lecturer_ids.includes(l.id!))
    .map((l) => l.name)
})
</script>

<template>
  <CRUPage page="Aktivitas" type="Detil" url="/activities">
    <div class="flex justify-end mb-4">
      <Button
        label="Edit"
        icon="pi pi-pencil"
        @click="router.push({ name: 'activities.edit', params: { id: route.params.id } })"
      />
    </div>
    <ActivityDetail
      v-if="activity"
      :activity="activity"
      :course-name="courseName"
      :semester-name="semesterName"
      :room-names="roomNames"
      :room-type-names="roomTypeNames"
      :lecturer-names="lecturerNames"
    />
  </CRUPage>
</template>
