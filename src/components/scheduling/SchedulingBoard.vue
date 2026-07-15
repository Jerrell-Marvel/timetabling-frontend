<script setup lang="ts">
/**
 * Orchestrates weekday, loading/flash, board, history, setting profile,
 * generate/edit/save, and read-only result mode. Hosts `useSchedule` — the
 * single authoritative model (R3); child components never re-derive placement
 * rules. Replaces `TimeTableIndexComponent`.
 */
import { computed, onMounted, ref } from 'vue'
import { useSchedule } from '@/composables/useSchedule'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/lib/api'
import { settingsService } from '@/services'
import type { Id, Setting } from '@/types'
import DayTabs from './DayTabs.vue'
import ScheduleActions from './ScheduleActions.vue'
import ScheduleFlashBanner from './ScheduleFlashBanner.vue'
import TimetableGrid from './TimetableGrid.vue'
import ManualSchedulingPanel from './ManualSchedulingPanel.vue'
import LoadingOverlay from '@/components/base/LoadingOverlay.vue'

const props = defineProps<{
  mode: 'edit' | 'result'
  /** Required when `mode === 'result'` — the semester whose saved schedule to show. */
  semesterId?: Id
}>()

const toast = useToast()
const {
  historyOptions,
  currentHistoryIdx,
  currentDay,
  currentSetting,
  editMode,
  selectedEdit,
  revision,
  forceInsertFlag,
  tableRows,
  notInserted,
  status,
  getAllRefData,
  getDBActivities,
  getInitSchedule,
  showSemesterSchedule,
  changeHistorySet,
  changeDay,
  enterEditMode,
  exitEditMode,
  setCurrentSelectedEdit,
  toggleForce,
  isForceInsert,
  checkValidation,
  addSchedule,
  removeSchedule,
  saveTimeTable,
  generateTimeTable,
} = useSchedule()

const settings = ref<Setting[]>([])
const loading = ref(false)
const generating = ref(false)
const saving = ref(false)
const flashMessage = ref('')
const flashStatus = ref(true)

const controlsDisabled = computed(() => loading.value || generating.value || saving.value || editMode.value)
const editDisabled = computed(() => loading.value || generating.value || saving.value)
const hasSelection = computed(() => selectedEdit.value != null)
const selectedDuration = computed(() => selectedEdit.value?.getDuration() ?? 0)

function setFlash(ok: boolean, message: string) {
  flashStatus.value = ok
  flashMessage.value = message
}

function refreshStatusFlash() {
  setFlash(status.value.status, status.value.message)
}

async function boot() {
  loading.value = true
  try {
    await getAllRefData()
    if (props.mode === 'edit') {
      settings.value = await settingsService.list()
      await getInitSchedule()
    } else if (props.semesterId != null) {
      await showSemesterSchedule(props.semesterId)
    }
    refreshStatusFlash()
  } catch (error) {
    toast.error(getErrorMessage(error, 'Gagal memuat data penjadwalan.'))
  } finally {
    loading.value = false
  }
}
onMounted(boot)

function onToggleEdit() {
  if (editMode.value) {
    exitEditMode()
    refreshStatusFlash()
  } else {
    enterEditMode()
  }
}

function onSelect(activityId: Id, duration: number) {
  setCurrentSelectedEdit(activityId, duration)
}

function onInsert(roomId: Id, col: number) {
  addSchedule(roomId, col)
}

function onRemove(activityId: Id) {
  removeSchedule(activityId)
}

async function onGenerate() {
  generating.value = true
  try {
    const result = await generateTimeTable()
    if (result === 'success') {
      refreshStatusFlash()
    } else {
      setFlash(false, 'Terjadi kesalahan saat melakukan generate')
    }
  } catch (error) {
    setFlash(false, 'Terjadi kesalahan saat melakukan generate')
    toast.error(getErrorMessage(error))
  } finally {
    generating.value = false
  }
}

async function onSave() {
  saving.value = true
  try {
    await saveTimeTable()
    setFlash(true, 'Berhasil menyimpan')
  } catch (error) {
    setFlash(false, 'Terjadi kesalahan saat menyimpan')
    toast.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4 relative">
    <ScheduleFlashBanner :message="flashMessage" :status="flashStatus" />

    <div class="flex items-center justify-between gap-4 flex-wrap">
      <DayTabs :model-value="currentDay" :disabled="controlsDisabled" @update:model-value="changeDay" />
      <ScheduleActions
        v-if="mode === 'edit'"
        :disabled="controlsDisabled"
        :edit-disabled="editDisabled"
        :edit-mode="editMode"
        :generating="generating"
        :saving="saving"
        :settings="settings"
        :current-setting-id="currentSetting"
        :history-options="historyOptions"
        :current-history-id="currentHistoryIdx >= 0 ? historyOptions[currentHistoryIdx]?.id ?? null : null"
        @update:current-setting-id="currentSetting = $event"
        @generate="onGenerate"
        @save="onSave"
        @toggle-edit="onToggleEdit"
        @select-history="changeHistorySet"
      />
    </div>

    <TimetableGrid
      :rows="tableRows"
      :edit-mode="mode === 'edit' && editMode"
      :has-selection="hasSelection"
      :selected-duration="selectedDuration"
      :get-activity="getDBActivities"
      :check-validation="checkValidation"
      :is-force-insert="isForceInsert"
      @insert="onInsert"
      @remove="onRemove"
    />

    <ManualSchedulingPanel
      v-if="mode === 'edit' && editMode"
      :not-inserted="notInserted"
      :get-activity="getDBActivities"
      :selected-id="selectedEdit?.getActivityId() ?? null"
      :force-insert="forceInsertFlag"
      :revision="revision"
      @select="onSelect"
      @toggle-force="toggleForce"
    />

    <LoadingOverlay :active="loading" />
  </div>
</template>
