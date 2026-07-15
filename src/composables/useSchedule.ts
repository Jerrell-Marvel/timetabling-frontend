import { computed, ref, shallowRef, triggerRef } from 'vue'
import { timetableService } from '@/services'
import { DBRef } from '@/lib/schedule/DBRef'
import { Schedule } from '@/lib/schedule/Schedule'
import { SelectedEdit } from '@/lib/schedule/SelectedEdit'
import type {
  Id,
  RoomActs,
  ScheduleActivity,
  ScheduleInitData,
  SlotPosition,
  ValidationResult,
} from '@/types'

export interface HistoryEntry {
  id: number
  label: string
}

/**
 * Orchestration state for the scheduling board (R3) — port of
 * `services/TimeTableServices.js`. Wraps the ported `Schedule` / `SelectedEdit` /
 * `DBRef` classes; components never re-derive placement rules inline, they call
 * this composable.
 */
export function useSchedule() {
  const dbRef = new DBRef()

  const schedule = shallowRef<Schedule | null>(null)
  const refDataLoaded = ref(false)

  // history: a stack of Schedule snapshots (one per init/generate), like legacy `history[]`.
  const historyStack: Schedule[] = []
  const historyOptions = ref<HistoryEntry[]>([])
  const currentHistoryIdx = ref(-1)

  const currentDay = ref(1)
  const currentSetting = ref<Id | null>(null)

  const editMode = ref(false)
  const selectedEdit = shallowRef<SelectedEdit | null>(null)
  const editableData = ref<RoomActs[]>([])
  /** Bumped whenever `notInserted`/`editableData` is rebuilt — a primitive signal
   * `ManualSchedulingPanel` can watch reliably (the underlying arrays mutate via
   * push/splice in place, so reference equality alone won't trigger a rerun). */
  const revision = ref(0)

  // ── ref data ────────────────────────────────────────────────────────────
  async function getAllRefData(): Promise<void> {
    const data = await timetableService.refData()
    dbRef.initDB(data)
    refDataLoaded.value = true
  }

  function getDBActivities(id: Id): ScheduleActivity {
    return dbRef.getActivities(id)
  }

  // ── init / history ──────────────────────────────────────────────────────
  function getLabel(): string {
    const errorCount = schedule.value?.getNotInserted().length ?? 0
    return `Generate ${currentHistoryIdx.value + 1} (${errorCount})`
  }

  function initData(data: ScheduleInitData): void {
    const sched = new Schedule(data)
    sched.createTableView(dbRef)
    historyStack.push(sched)
    currentHistoryIdx.value = historyStack.length - 1
    schedule.value = sched
    historyOptions.value = [
      ...historyOptions.value,
      { id: currentHistoryIdx.value, label: getLabel() },
    ]
    if (editMode.value) startEditMode()
  }

  async function getInitSchedule(): Promise<void> {
    const data = await timetableService.initSchedule()
    initData(data)
  }

  async function showSemesterSchedule(semesterId: Id): Promise<void> {
    const data = await timetableService.show(semesterId)
    initData(data)
  }

  function changeHistorySet(id: number): void {
    const target = historyStack[id]
    if (!target) return
    currentHistoryIdx.value = id
    schedule.value = target
    if (editMode.value) startEditMode()
  }

  // ── day / render ────────────────────────────────────────────────────────
  function changeDay(day: number): void {
    currentDay.value = day
    if (editMode.value) startEditMode()
  }

  const tableRows = computed(() => {
    if (!schedule.value) return []
    return (schedule.value.getTableView(currentDay.value) ?? []).filter((row) => row)
  })

  const notInserted = computed<Id[]>(() => schedule.value?.getNotInserted() ?? [])
  const conflicts = computed<Id[]>(() => schedule.value?.getConflicts() ?? [])

  const status = computed(() => {
    const conflictCount = conflicts.value.length
    const notInsertedCount = notInserted.value.length
    const ok = conflictCount === 0 && notInsertedCount === 0
    const message = ok
      ? ': Tidak ada aktivitas tersisa!'
      : `: ${conflictCount} Aktivitas yang bentrok dan ${notInsertedCount - conflictCount} Aktivitas tidak dapat dijadwalkan!`
    return { status: ok, message }
  })

  // ── edit mode ───────────────────────────────────────────────────────────
  function startEditMode(): void {
    if (!schedule.value) return
    editableData.value = schedule.value.createRoomActs(currentDay.value)
    revision.value++
  }

  function enterEditMode(): void {
    editMode.value = true
    startEditMode()
  }

  function exitEditMode(): void {
    editMode.value = false
    selectedEdit.value = null
  }

  /** Mirrors `SelectedEdit.isForceInsert()` in a `ref` so templates re-render on
   * toggle — the flag itself lives on a plain class instance mutated in place. */
  const forceInsertFlag = ref(false)

  function setCurrentSelectedEdit(activityId: Id, duration: number): void {
    selectedEdit.value = activityId === -1 ? null : new SelectedEdit(activityId, duration, dbRef)
    forceInsertFlag.value = false
  }

  function toggleForce(): void {
    selectedEdit.value?.toggleForce()
    forceInsertFlag.value = selectedEdit.value?.isForceInsert() ?? false
  }

  function isForceInsert(): boolean {
    return selectedEdit.value?.isForceInsert() ?? false
  }

  function checkValidation(obj: SlotPosition): ValidationResult {
    if (!selectedEdit.value) return { status: true, messages: [] }
    return selectedEdit.value.checkValidation(obj, currentDay.value, editableData.value)
  }

  function reArrangeTable(): void {
    selectedEdit.value = null
    if (!schedule.value) return
    schedule.value.createTableView(dbRef)
    triggerRef(schedule)
    startEditMode()
  }

  function addSchedule(roomId: Id, col: number): void {
    if (!selectedEdit.value || !schedule.value) return
    const duration = selectedEdit.value.getDuration()
    const start = col + 7
    const end = start + duration
    schedule.value.addSchedule(selectedEdit.value.getActivityId(), currentDay.value, roomId, start, end)
    reArrangeTable()
  }

  function removeSchedule(activityId: Id): void {
    schedule.value?.removeSchedule(activityId)
    reArrangeTable()
  }

  // ── save / generate ─────────────────────────────────────────────────────
  async function saveTimeTable(): Promise<void> {
    if (!schedule.value) return
    await timetableService.save({
      data: schedule.value.getInserted(),
      notInsert: schedule.value.getNotInserted(),
    })
  }

  /** Returns `'success'` (re-inits from the result) or `'fail'` (nothing scheduled). */
  async function generateTimeTable(): Promise<'success' | 'fail'> {
    if (!schedule.value) return 'fail'
    const data = await timetableService.generate({
      setting_id: currentSetting.value,
      data: schedule.value.getInserted(),
    })
    if (data.inserted.length > 0) {
      initData(data)
      return 'success'
    }
    return 'fail'
  }

  return {
    // state
    schedule,
    refDataLoaded,
    historyOptions,
    currentHistoryIdx,
    currentDay,
    currentSetting,
    editMode,
    selectedEdit,
    editableData,
    revision,
    forceInsertFlag,
    tableRows,
    notInserted,
    conflicts,
    status,
    // ref data
    getAllRefData,
    getDBActivities,
    // init / history
    getInitSchedule,
    showSemesterSchedule,
    changeHistorySet,
    // day
    changeDay,
    // edit mode
    enterEditMode,
    exitEditMode,
    setCurrentSelectedEdit,
    toggleForce,
    isForceInsert,
    checkValidation,
    addSchedule,
    removeSchedule,
    // save / generate
    saveTimeTable,
    generateTimeTable,
  }
}

export type UseScheduleReturn = ReturnType<typeof useSchedule>
