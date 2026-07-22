<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TreeNode } from 'primevue/treenode'
import CRUPage from '@/layout/CRUPage.vue'
import SettingFormFields from '@/components/settings/SettingFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import api from '@/lib/api'
import {
  activityTypesService,
  jurusansService,
  roomsService,
  roomTypesService,
  semestersService,
  settingsService,
} from '@/services'
import { SETTINGABLE_TYPES, semesterLabel } from '@/types'
import type {
  Jurusan,
  Option,
  Room,
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

/**
 * Group nodes carry a synthetic prefixed key so they can never collide with a
 * leaf key (a stringified record id) — the same reason Laravel's tree builders
 * numbered their group nodes -1, -2, -3, … `HierarchySelector` drops them from
 * the model, so only real ids are ever persisted.
 */
function groupNode(key: string, label: string, children: TreeNode[]): TreeNode {
  return { key: `grp:${key}`, label, children }
}

/** Group preserving first-seen order, like Laravel's `groupBy`. */
function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    const bucket = groups.get(key)
    if (bucket) bucket.push(item)
    else groups.set(key, [item])
  }
  return groups
}

/** Unit → Gedung → Lantai → Ruangan. Mirrors `SettingController::createRoomTree`. */
function buildRoomTree(rooms: Room[]): TreeNode[] {
  const units = groupBy(rooms, (r) => r.unitOwner ?? '')
  const unitNodes = [...units].map(([unit, unitRooms]) => {
    const buildings = groupBy(unitRooms, (r) => r.building ?? '')
    const buildingNodes = [...buildings].map(([building, buildingRooms]) => {
      const floors = groupBy(buildingRooms, (r) => r.floor ?? '')
      const floorNodes = [...floors].map(([floor, floorRooms]) =>
        groupNode(
          `${unit}|${building}|${floor}`,
          `Lantai ${floor}`,
          floorRooms.map((r) => ({ key: String(r.id), label: r.name })),
        ),
      )
      return groupNode(`${unit}|${building}`, `Gedung ${building}`, floorNodes)
    })
    return groupNode(unit, `Unit ${unit}`, buildingNodes)
  })

  return unitNodes.length ? [groupNode('all-rooms', 'Semua', unitNodes)] : []
}

/** Fakultas → Jurusan. Mirrors `SettingController::createJurusanTree`. */
function buildJurusanTree(jurusans: Jurusan[]): TreeNode[] {
  const faculties = groupBy(jurusans, (j) => j.faculty ?? '')
  const facultyNodes = [...faculties].map(([faculty, items]) =>
    groupNode(
      faculty || 'tanpa-fakultas',
      faculty || 'Tanpa Fakultas',
      items.map((j) => ({ key: String(j.id), label: j.name })),
    ),
  )

  return facultyNodes.length ? [groupNode('all-jurusans', 'Semua', facultyNodes)] : []
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
const activityTypeOptions = ref<Option<string>[]>([])
const activityOptions = ref<Option<string>[]>([])

/** Hierarchical views of the same jurusan/room sets, for `HierarchySelector`. */
const jurusanTree = ref<TreeNode[]>([])
const roomTree = ref<TreeNode[]>([])

const { errors, processing, submit } = useApiForm()

/** How many options exist per type, used to detect a "select all" selection. */
const optionCounts = computed<Partial<Record<SettingableType, number>>>(() => ({
  jurusan: jurusanOptions.value.length,
  room: roomOptions.value.length,
  roomType: roomTypeOptions.value.length,
  activityType: activityTypeOptions.value.length,
  activity: activityOptions.value.length,
  hari: 6,
  waktu: 17,
}))

onMounted(async () => {
  const [semesters, jurusans, rooms, roomTypes, activityTypes, activities] = await Promise.all([
    semestersService.list(),
    jurusansService.list(),
    roomsService.list(),
    roomTypesService.list(),
    activityTypesService.list(),
    api.get<ActivityOption[]>('/activities').then((r) => r.data),
  ])

  semesterOptions.value = semesters.map((s) => ({ label: semesterLabel(s), value: s.id! }))
  jurusanOptions.value = jurusans.map((j) => ({ label: j.name, value: String(j.id) }))
  roomOptions.value = rooms.map((r) => ({ label: r.roomCode, value: String(r.id) }))
  roomTypeOptions.value = roomTypes.map((rt) => ({ label: rt.name, value: String(rt.id) }))
  activityTypeOptions.value = activityTypes.map((at) => ({ label: at.name, value: String(at.id) }))
  jurusanTree.value = buildJurusanTree(jurusans)
  roomTree.value = buildRoomTree(rooms)
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
    form.constraints.activityType = activityTypeOptions.value.map((o) => o.value)
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
      :jurusan-tree="jurusanTree"
      :room-tree="roomTree"
      :room-type-options="roomTypeOptions"
      :activity-type-options="activityTypeOptions"
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
