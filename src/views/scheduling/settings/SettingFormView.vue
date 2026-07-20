<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import SettingFormFields from '@/components/settings/SettingFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import api from '@/lib/api'
import {
  jurusansService,
  roomsService,
  roomTypesService,
  semestersService,
  settingsService,
} from '@/services'
import { SETTINGABLE_TYPES, semesterLabel } from '@/types'
import type {
  Option,
  SettingConstraints,
  SettingFormState,
  SettingableType,
} from '@/types'

/**
 * Minimal shape for the activity options: the shared `Activity` type is still
 * pre-migration and does NOT match what the API returns (`Activity.course_id`
 * vs `course_code`/`course_class`). Typed locally so this module stays correct
 * without half-migrating that type.
 * TODO: switch to activitiesService once the Activity module migrates.
 */
interface ActivityOption {
  id: number
  course_code: string
  course_class: string
}

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<SettingFormState>({
  name: '',
  semesterId: null,
  constraints: {
    roomType: [],
    room: [],
    activityType: [],
    activity: [],
    waktu: [],
    hari: [],
    jurusan: [],
  },
})

const semesterOptions = ref<Option[]>([])
const jurusanOptions = ref<Option<string>[]>([])
const roomOptions = ref<Option<string>[]>([])
const roomTypeOptions = ref<Option<string>[]>([])
const activityOptions = ref<Option<string>[]>([])
const { errors, processing, submit } = useApiForm()

/**
 * How many options exist per type, used to detect a "select all" selection.
 * `activityType` is absent on purpose — with no listing endpoint we cannot know
 * its full set, so its values are always sent through verbatim.
 */
const optionCounts = computed<Partial<Record<SettingableType, number>>>(() => ({
  jurusan: jurusanOptions.value.length,
  room: roomOptions.value.length,
  roomType: roomTypeOptions.value.length,
  activity: activityOptions.value.length,
  hari: 6,
  waktu: 17,
}))

onMounted(async () => {
  const [semesters, jurusans, rooms, roomTypes, activities] = await Promise.all([
    semestersService.list(),
    jurusansService.list(),
    roomsService.list(),
    roomTypesService.list(),
    api.get<ActivityOption[]>('/activities').then((r) => r.data),
  ])

  semesterOptions.value = semesters.map((s) => ({ label: semesterLabel(s), value: s.id! }))
  jurusanOptions.value = jurusans.map((j) => ({ label: j.name, value: String(j.id) }))
  roomOptions.value = rooms.map((r) => ({ label: r.roomCode, value: String(r.id) }))
  roomTypeOptions.value = roomTypes.map((rt) => ({ label: rt.name, value: String(rt.id) }))
  activityOptions.value = activities.map((a) => ({
    label: `${a.course_code} ${a.course_class}`.trim() || `Aktivitas #${a.id}`,
    value: String(a.id),
  }))

  if (id.value === null) {
    // New setting: everything allowed, mirroring how the backend reports a
    // setting that stores no constraint rows.
    form.constraints.jurusan = jurusanOptions.value.map((o) => o.value)
    form.constraints.room = roomOptions.value.map((o) => o.value)
    form.constraints.roomType = roomTypeOptions.value.map((o) => o.value)
    form.constraints.activity = activityOptions.value.map((o) => o.value)
    form.constraints.hari = ['1', '2', '3', '4', '5', '6']
    form.constraints.waktu = Array.from({ length: 17 }, (_, i) => String(i + 7))
    return
  }

  // Edit: the detail endpoint expands unstored types to their full defaults, so
  // what comes back is already the effective selection.
  const detail = await settingsService.get(id.value)
  form.name = detail.name
  form.semesterId = detail.semesterId
  for (const key of SETTINGABLE_TYPES) {
    form.constraints[key] = detail.constraints[key] ?? []
  }
})

async function handleSubmit() {
  const constraints: SettingConstraints = {}
  const selectAll: string[] = []

  for (const key of SETTINGABLE_TYPES) {
    const selected = form.constraints[key] ?? []
    const total = optionCounts.value[key]
    // A fully-selected type is sent as "select all" so the backend stores zero
    // rows (its own size check does the same, but this states the intent).
    if (total !== undefined && total > 0 && selected.length === total) {
      selectAll.push(key)
    } else {
      constraints[key] = selected
    }
  }

  await submit(() =>
    isEdit.value
      ? // `semesterId` is deliberately omitted: the backend ignores it on update.
        settingsService.update(id.value!, { name: form.name, constraints, selectAll })
      : settingsService.create({
          name: form.name,
          semesterId: form.semesterId,
          constraints,
          selectAll,
        }),
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

    <SettingFormFields
      :model-value="form"
      :errors="errors"
      :is-edit="isEdit"
      :semester-options="semesterOptions"
      :jurusan-options="jurusanOptions"
      :room-options="roomOptions"
      :room-type-options="roomTypeOptions"
      :activity-options="activityOptions"
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
