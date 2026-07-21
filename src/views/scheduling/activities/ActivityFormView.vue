<script setup lang="ts">
/**
 * Create/edit an Activity. One form, one Save button — `activitiesService.saveForm`
 * fans it out to `/api/activities` and `/api/activity-constraints`.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import ActivityFormFields from '@/components/activities/ActivityFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { useToast } from '@/composables/useToast'
import {
  activitiesService,
  activityTypesService,
  coursesService,
  lecturersService,
  roomsService,
  roomTypesService,
  semestersService,
} from '@/services'
import { emptyActivityForm, semesterLabel } from '@/types'
import type { ActivityFormModel, Option } from '@/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = ref<ActivityFormModel>(emptyActivityForm())

const semesterOptions = ref<Option[]>([])
const courseOptions = ref<Option[]>([])
const activityTypeOptions = ref<Option[]>([])
const roomOptions = ref<Option<string>[]>([])
const roomTypeOptions = ref<Option<string>[]>([])
const lecturerOptions = ref<Option<string>[]>([])
const activityOptions = ref<Option<string>[]>([])
const loading = ref(true)

const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  try {
    const [semesters, courses, activityTypes, rooms, roomTypes, lecturers, activities] =
      await Promise.all([
        semestersService.list(),
        coursesService.list(),
        activityTypesService.list(),
        roomsService.list(),
        roomTypesService.list(),
        lecturersService.list(),
        activitiesService.list(),
      ])

    semesterOptions.value = semesters.map((s) => ({ label: semesterLabel(s), value: s.id! }))
    courseOptions.value = courses.map((c) => ({ label: `${c.code} — ${c.name}`, value: c.id! }))
    activityTypeOptions.value = activityTypes.map((t) => ({ label: t.name, value: t.id! }))

    // Constraint values are strings server-side, so every option below is keyed
    // by a string to keep Select's equality check working.
    roomOptions.value = rooms.map((r) => ({ label: r.roomCode, value: String(r.id) }))
    roomTypeOptions.value = roomTypes.map((rt) => ({ label: rt.name, value: String(rt.id) }))
    lecturerOptions.value = lecturers.map((l) => ({
      label: `${l.name} (${l.nik})`,
      value: l.nik, // LECTURER constraints store the NIK, not the row id
    }))
    activityOptions.value = activities
      .filter((a) => a.id !== id.value)
      .map((a) => ({ label: a.name ?? `Aktivitas #${a.id}`, value: String(a.id) }))

    if (id.value !== null) {
      form.value = await activitiesService.loadForm(id.value)
    } else {
      // Default a new activity to the current semester, as the legacy form did.
      const current = semesters.find((s) => s.current)
      if (current) form.value.semesterId = current.id!
    }
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  try {
    await submit(() => activitiesService.saveForm(form.value, id.value))
  } catch {
    // useApiForm has already mapped any 422 field errors onto `errors`.
    toast.error('Gagal menyimpan aktivitas. Periksa kembali data yang diisi.')
    return
  }
  toast.success(isEdit.value ? 'Aktivitas berhasil diubah.' : 'Aktivitas berhasil disimpan.')
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

    <div v-if="loading" class="py-10 text-center text-surface-400">Memuat data…</div>

    <template v-else>
      <ActivityFormFields
        v-model="form"
        :errors="errors"
        :semester-options="semesterOptions"
        :course-options="courseOptions"
        :activity-type-options="activityTypeOptions"
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
    </template>
  </CRUPage>
</template>
