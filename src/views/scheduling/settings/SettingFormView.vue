<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import SettingFormFields from '@/components/settings/SettingFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import {
  activitiesService,
  coursesService,
  prodisService,
  roomsService,
  roomTypesService,
  semestersService,
  settingsService,
} from '@/services'
import type { Setting, Option, Prodi } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<Setting>({
  name: '',
  semester_id: 0,
  prodi_ids: [],
  activity_ids: [],
  room_ids: [],
  room_type_ids: [],
  days: [],
  time_ranges: [],
})

const semesterOptions = ref<Option[]>([])
const prodis = ref<Prodi[]>([])
const activityOptions = ref<Option[]>([])
const roomOptions = ref<Option[]>([])
const roomTypeOptions = ref<Option[]>([])
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  const [semesters, prodiList, activities, courses, rooms, roomTypes] = await Promise.all([
    semestersService.list(),
    prodisService.list(),
    activitiesService.list(),
    coursesService.list(),
    roomsService.list(),
    roomTypesService.list(),
  ])
  semesterOptions.value = semesters.map((s) => ({ label: s.name, value: s.id! }))
  prodis.value = prodiList
  activityOptions.value = activities.map((a) => ({
    label: courses.find((c) => c.id === a.course_id)?.name ?? `Aktivitas #${a.id}`,
    value: a.id!,
  }))
  roomOptions.value = rooms.map((r) => ({ label: r.code, value: r.id! }))
  roomTypeOptions.value = roomTypes.map((rt) => ({ label: rt.name, value: rt.id! }))

  if (id.value !== null) {
    const data = await settingsService.get(id.value)
    Object.assign(form, data)
  }
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? settingsService.update(id.value!, form) : settingsService.create(form),
  )
  router.push({ name: 'settings.index' })
}
</script>

<template>
  <CRUPage page="Pengaturan" :type="isEdit ? 'Ubah' : 'Buat'" url="/settings">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <div class="mb-4 max-w-md">
      <label class="block text-sm font-medium text-surface-700 mb-1">Semester</label>
      <Select
        v-model="form.semester_id"
        :options="semesterOptions"
        option-label="label"
        option-value="value"
        class="w-full"
      />
    </div>

    <SettingFormFields
      :model-value="form"
      :errors="errors"
      :prodis="prodis"
      :activity-options="activityOptions"
      :room-options="roomOptions"
      :room-type-options="roomTypeOptions"
    />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'settings.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
