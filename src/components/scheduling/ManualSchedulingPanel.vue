<script setup lang="ts">
/**
 * Side panel driving edit mode: unplaced-activity list, search, selected
 * activity details, force-insert toggle. Replaces `EditTableComponent`.
 * Draggable via the header bars, matching the legacy free-floating panel.
 */
import { computed, ref, watch } from 'vue'
import type { Id, ScheduleActivity } from '@/types'

const props = defineProps<{
  notInserted: Id[]
  getActivity: (id: Id) => ScheduleActivity
  selectedId: Id | null
  forceInsert: boolean
  /** Bumped by `useSchedule` whenever the unplaced list is rebuilt. */
  revision: number
}>()
const emit = defineEmits<{
  select: [activityId: Id, duration: number]
  'toggle-force': []
}>()

const search = ref('')
const panel = ref<HTMLElement | null>(null)
const offset = ref({ x: 0, y: 0 })
const dragging = ref(false)

const items = computed(() =>
  props.notInserted.map((id) => ({ id, activity: props.getActivity(id) })).slice().reverse(),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    ({ activity }) =>
      activity.course.name.toLowerCase().includes(q) ||
      activity.course_code.toLowerCase().includes(q),
  )
})

const selected = computed(() => (props.selectedId != null ? props.getActivity(props.selectedId) : null))

// Re-select the most recently unplaced activity whenever the list is rebuilt —
// mirrors legacy `createNotInsertedList()` always re-activating the last entry.
watch(
  () => props.revision,
  () => {
    if (props.notInserted.length === 0) {
      emit('select', -1, 0)
      return
    }
    const lastId = props.notInserted[props.notInserted.length - 1]!
    emit('select', lastId, props.getActivity(lastId).duration)
  },
  { immediate: true },
)

watch(search, () => {
  const first = filtered.value[0]
  if (first) emit('select', first.id, first.activity.duration)
})

function pick(id: Id) {
  emit('select', id, props.getActivity(id).duration)
}

function startDrag(e: MouseEvent) {
  if (!panel.value) return
  dragging.value = true
  const rect = panel.value.getBoundingClientRect()
  offset.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!dragging.value || !panel.value) return
  panel.value.style.left = `${e.clientX - offset.value.x}px`
  panel.value.style.top = `${e.clientY - offset.value.y}px`
}

function stopDrag() {
  dragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div
    ref="panel"
    class="fixed z-[1050] w-80 rounded-2xl border border-surface-100 bg-white shadow-lg"
    style="top: 6rem; right: 1.5rem"
  >
    <div
      class="rounded-t-2xl bg-surface-50 border-b border-surface-100 px-4 py-2 text-xs text-surface-400 cursor-move select-none"
      @mousedown="startDrag"
    >
      Tekan disini untuk memindahkan
    </div>

    <div class="p-4">
      <h5 class="text-sm font-bold text-surface-900">Aktivitas Bentrok / Belum Plot</h5>
      <p class="text-xs text-surface-400 mt-1">
        Pilih aktivitas yang diinginkan untuk ditambahkan kedalam cell berwarna tosca.
      </p>
      <div class="flex items-center gap-2 mt-3">
        <ToggleSwitch :model-value="forceInsert" @update:model-value="$emit('toggle-force')" />
        <span class="text-sm text-surface-700">Mode Paksa</span>
      </div>
    </div>

    <div class="px-4 pb-2">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Cari Aktivitas" class="w-full" />
      </IconField>
    </div>

    <ul class="max-h-40 overflow-auto divide-y divide-surface-100">
      <li
        v-for="item in filtered"
        :key="item.id"
        class="px-4 py-2 text-sm cursor-pointer hover:bg-surface-50"
        :class="item.id === selectedId ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-surface-700'"
        @click="pick(item.id)"
      >
        {{ item.activity.course_code }} ({{ item.activity.course_class }}) -
        {{ item.activity.course.name }} ({{ item.activity.course_session }})
      </li>
      <li v-if="!filtered.length" class="px-4 py-3 text-sm text-surface-400">Tidak ada aktivitas.</li>
    </ul>

    <hr class="border-surface-100" />

    <div class="p-4">
      <h5 class="text-sm font-bold text-surface-900">Aktivitas Terpilih</h5>
      <div v-if="selected" class="mt-2 max-h-48 overflow-y-auto text-sm">
        <h6 class="font-semibold text-surface-900">{{ selected.course.name }}</h6>
        <p class="text-xs text-surface-400 mt-0.5">
          {{ selected.course.code }} ({{ selected.course_class }}) Sesi {{ selected.course_session }}
        </p>
        <p class="mt-2 text-surface-600">Waktu : {{ selected.duration }} Jam</p>
        <div class="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span class="font-semibold text-surface-700">Ruangan</span>
            <p v-for="r in selected.activity_rooms" :key="r.room_code" class="text-surface-600">
              {{ r.room_code }}
            </p>
          </div>
          <div>
            <span class="font-semibold text-surface-700">Tipe Ruangan</span>
            <p v-for="t in selected.activity_room_types" :key="t.id" class="text-surface-600">
              {{ t.name }}
            </p>
          </div>
        </div>
        <p v-for="l in selected.activity_lecturers" :key="l.nik" class="text-surface-600 mt-1">
          {{ l.name }}
        </p>
      </div>
      <p v-else class="text-sm text-surface-400 mt-2">Tidak ada aktivitas terpilih.</p>
    </div>

    <div
      class="rounded-b-2xl bg-surface-50 border-t border-surface-100 px-4 py-2 text-xs text-surface-400 cursor-move select-none"
      @mousedown="startDrag"
    >
      Tekan disini untuk memindahkan
    </div>
  </div>
</template>
