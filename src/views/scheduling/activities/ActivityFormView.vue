<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import ActivityFormFields from '@/components/activities/ActivityFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import {
  activitiesService,
  coursesService,
  lecturersService,
  roomsService,
  roomTypesService,
  semestersService,
} from '@/services'
import type { Activity, Option } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<Activity>({
  semester_id: 0,
  course_id: 0,
  quota: 0,
  duration: 1,
  parallel: 1,
  room_ids: [],
  room_type_ids: [],
  lecturer_ids: [],
  day_gaps: [],
})

const semesterOptions = ref<Option[]>([])
const courseOptions = ref<Option[]>([])
const roomOptions = ref<Option[]>([])
const roomTypeOptions = ref<Option[]>([])
const lecturerOptions = ref<Option[]>([])
const activityOptions = ref<Option[]>([])
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  const [semesters, courses, rooms, roomTypes, lecturers, activities] = await Promise.all([
    semestersService.list(),
    coursesService.list(),
    roomsService.list(),
    roomTypesService.list(),
    lecturersService.list(),
    activitiesService.list(),
  ])
  semesterOptions.value = semesters.map((s) => ({ label: s.name, value: s.id! }))
  courseOptions.value = courses.map((c) => ({ label: c.name, value: c.id! }))
  roomOptions.value = rooms.map((r) => ({ label: r.code, value: r.id! }))
  roomTypeOptions.value = roomTypes.map((rt) => ({ label: rt.name, value: rt.id! }))
  lecturerOptions.value = lecturers.map((l) => ({ label: l.name, value: l.id! }))
  activityOptions.value = activities
    .filter((a) => a.id !== id.value)
    .map((a) => ({
      label: courses.find((c) => c.id === a.course_id)?.name ?? `Aktivitas #${a.id}`,
      value: a.id!,
    }))

  if (id.value !== null) {
    const data = await activitiesService.get(id.value)
    Object.assign(form, data)
  }
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? activitiesService.update(id.value!, form) : activitiesService.create(form),
  )
  router.push({ name: 'activities.index' })
}
</script>

<template>
  <CRUPage page="Aktivitas" :type="isEdit ? 'Ubah' : 'Buat'" url="/activities">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <ActivityFormFields
      :model-value="form"
      :errors="errors"
      :semester-options="semesterOptions"
      :course-options="courseOptions"
      :room-options="roomOptions"
      :room-type-options="roomTypeOptions"
      :lecturer-options="lecturerOptions"
      :activity-options="activityOptions"
    />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'activities.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
