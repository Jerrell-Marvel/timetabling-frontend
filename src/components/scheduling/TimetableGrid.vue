<script setup lang="ts">
/**
 * Room × time-slot grid. Normal render (merged colspan blocks) + edit-mode slot
 * decomposition, placement validation calls, manual removal, force-insert
 * trigger. 17 hourly columns (07:00–24:00); a placed activity spans `duration`
 * columns. Replaces `TimeTableComponent`.
 */
import { computed, ref } from 'vue'
import type { RoomTableView, TableCell } from '@/lib/schedule/Schedule'
import type { Id, ScheduleActivity, SlotPosition, ValidationResult } from '@/types'
import ActivityHoverCard from './ActivityHoverCard.vue'
import PlacementDiagnostics from './PlacementDiagnostics.vue'
import ConfirmActionDialog from '@/components/base/ConfirmActionDialog.vue'

const props = defineProps<{
  rows: RoomTableView[]
  editMode: boolean
  hasSelection: boolean
  selectedDuration: number
  getActivity: (id: Id) => ScheduleActivity
  checkValidation: (pos: SlotPosition) => ValidationResult
  isForceInsert: () => boolean
}>()
const emit = defineEmits<{
  insert: [roomId: Id, col: number]
  remove: [activityId: Id]
}>()

const hours = Array.from({ length: 17 }, (_, i) => `${i + 7} - ${i + 8}`)

interface RenderGroup {
  col: number
  width: number
  cell: TableCell
}

function buildGroups(td: TableCell[]): RenderGroup[] {
  const groups: RenderGroup[] = []
  let col = 0
  for (let i = 1; i < td.length; i++) {
    const cell = td[i]!
    if (cell.colspan === 0) continue // hidden padding — carries no columns
    const width = cell.colspan ?? 1
    groups.push({ col, width, cell })
    col += width
  }
  return groups
}

function roomCode(row: RoomTableView): string {
  return String(row.td[0]?.value ?? '')
}

// ── read-only hover (course info card) ──────────────────────────────────────
const hoverActivity = ref<ScheduleActivity | null>(null)
const hoverX = ref(0)
const hoverY = ref(0)

function onCellHover(e: MouseEvent, cell: TableCell) {
  if (cell.data_id == null) return
  hoverActivity.value = props.getActivity(cell.data_id)
  hoverX.value = e.clientX
  hoverY.value = e.clientY
}
function onCellLeave() {
  hoverActivity.value = null
}
function onCellMove(e: MouseEvent) {
  if (!hoverActivity.value) return
  hoverX.value = e.clientX
  hoverY.value = e.clientY
}

// ── edit-mode slot hover / validation ───────────────────────────────────────
interface ActiveSlot {
  roomId: Id
  col: number
  span: number
  valid: boolean
  messages: string[]
}
const activeSlot = ref<ActiveSlot | null>(null)
const diagX = ref(0)
const diagY = ref(0)

function onSlotEnter(e: MouseEvent, row: RoomTableView, group: RenderGroup, offsetInGroup: number) {
  if (!props.hasSelection) return
  const col = group.col + offsetInGroup
  const availableRun = group.width - offsetInGroup
  const result = props.checkValidation({ col, room: roomCode(row), room_id: row.data_id })
  const messages = [...result.messages]
  const span = Math.min(props.selectedDuration, availableRun)
  let valid = result.status
  if (availableRun < props.selectedDuration) {
    valid = false
    messages.push('Durasi Aktivitas melebih Slot yang dipilih!')
  }
  activeSlot.value = { roomId: row.data_id, col, span, valid, messages }
  diagX.value = e.clientX
  diagY.value = e.clientY
}
function onSlotMove(e: MouseEvent) {
  if (!activeSlot.value) return
  diagX.value = e.clientX
  diagY.value = e.clientY
}
function onSlotLeave() {
  activeSlot.value = null
}

function slotHighlightClass(roomId: Id, col: number): string {
  const s = activeSlot.value
  if (!s || s.roomId !== roomId || col < s.col || col >= s.col + s.span) return ''
  if (s.valid) return 'bg-emerald-100 outline outline-emerald-400'
  if (props.isForceInsert()) return 'bg-amber-100 outline outline-amber-400'
  return 'bg-red-100 outline outline-red-400'
}

const forceInsertRef = ref<InstanceType<typeof ConfirmActionDialog> | null>(null)

function onSlotClick(row: RoomTableView, group: RenderGroup, offsetInGroup: number) {
  if (!props.hasSelection) return
  const col = group.col + offsetInGroup
  const s = activeSlot.value
  if (s && s.roomId === row.data_id && s.col === col && s.valid) {
    emit('insert', row.data_id, col)
    activeSlot.value = null
    return
  }
  if (props.isForceInsert()) {
    forceInsertRef.value?.confirm({
      header: 'Masukan aktivitas secara paksa?',
      message: 'Yakin ingin memaksakan aktivitas ini masuk?',
      acceptLabel: 'Yakin!',
      rejectLabel: 'Tidak Yakin',
      acceptSeverity: 'danger',
      accept: () => {
        emit('insert', row.data_id, col)
        activeSlot.value = null
      },
    })
  }
}

const roomGroups = computed(() => props.rows.map((row) => ({ row, groups: buildGroups(row.td) })))
</script>

<template>
  <div class="overflow-auto max-h-[700px] border border-surface-100 rounded-2xl">
    <table class="w-full text-sm border-collapse">
      <thead class="sticky top-0 bg-surface-50 z-10">
        <tr>
          <th class="border border-surface-100 px-2 py-1.5 text-left">Ruangan</th>
          <th v-for="h in hours" :key="h" class="border border-surface-100 px-2 py-1.5 whitespace-nowrap">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ row, groups } in roomGroups" :key="row.data_id">
          <td class="border border-surface-100 px-2 py-1 font-medium whitespace-nowrap">
            {{ roomCode(row) }}
          </td>

          <template v-if="!editMode">
            <td
              v-for="group in groups"
              :key="group.col"
              :colspan="group.width"
              class="border border-surface-100 px-1 py-1 align-top"
              :style="group.cell.style"
              @mouseenter="onCellHover($event, group.cell)"
              @mousemove="onCellMove"
              @mouseleave="onCellLeave"
            >
              <p class="whitespace-normal">{{ group.cell.value }}</p>
            </td>
          </template>

          <template v-else>
            <template v-for="group in groups" :key="group.col">
              <td
                v-if="group.cell.data_id != null"
                :colspan="group.width"
                class="relative border border-surface-100 px-1 py-1 align-top"
                :style="group.cell.style"
              >
                <p class="whitespace-normal pr-5">{{ group.cell.value }}</p>
                <button
                  type="button"
                  class="absolute top-0.5 right-0.5 text-red-600 hover:text-red-800"
                  @click.stop="emit('remove', group.cell.data_id)"
                >
                  <i class="pi pi-trash text-xs"></i>
                </button>
              </td>
              <td
                v-for="k in group.width"
                v-else
                :key="k"
                class="border border-surface-100 h-8 w-8 cursor-pointer"
                :class="slotHighlightClass(row.data_id, group.col + k - 1)"
                @mouseenter="onSlotEnter($event, row, group, k - 1)"
                @mousemove="onSlotMove"
                @mouseleave="onSlotLeave"
                @click="onSlotClick(row, group, k - 1)"
              ></td>
            </template>
          </template>
        </tr>
      </tbody>
    </table>

    <ActivityHoverCard :activity="hoverActivity" :x="hoverX" :y="hoverY" />
    <PlacementDiagnostics :messages="activeSlot?.messages ?? []" :x="diagX" :y="diagY" />
    <ConfirmActionDialog ref="forceInsertRef" />
  </div>
</template>
