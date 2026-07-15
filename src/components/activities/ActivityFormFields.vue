<script setup lang="ts">
/**
 * Selecting a semester reloads course-derived info (`activities/sems/{sems}`) —
 * here shown as a count of activities already registered for that semester,
 * with a loading state on the control while in flight.
 */
import { ref, watch } from 'vue'
import DayGapList from '@/components/controls/DayGapList.vue'
import { activitiesService } from '@/services'
import type { Activity, Option } from '@/types'

defineProps<{
  errors?: Record<string, string>
  semesterOptions: Option[]
  courseOptions: Option[]
  roomOptions: Option[]
  roomTypeOptions: Option[]
  lecturerOptions: Option[]
  /** Other activities (excluding self), used as DayGapList's row options. */
  activityOptions: Option[]
}>()

const modelValue = defineModel<Activity>({ required: true })

const relatedCount = ref<number | null>(null)
const loadingRelated = ref(false)

watch(
  () => modelValue.value.semester_id,
  async (semesterId) => {
    relatedCount.value = null
    if (!semesterId) return
    loadingRelated.value = true
    try {
      const related = await activitiesService.bySemester(semesterId)
      relatedCount.value = related.filter((a) => a.id !== modelValue.value.id).length
    } finally {
      loadingRelated.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Semester</label>
        <Select
          v-model="modelValue.semester_id"
          :options="semesterOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
        <p v-if="loadingRelated" class="text-xs text-surface-400 mt-1">Memuat data terkait…</p>
        <p v-else-if="relatedCount !== null" class="text-xs text-surface-400 mt-1">
          {{ relatedCount }} aktivitas lain sudah terdaftar di semester ini.
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Matakuliah</label>
        <Select
          v-model="modelValue.course_id"
          :options="courseOptions"
          option-label="label"
          option-value="value"
          filter
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Kuota</label>
        <InputNumber v-model="modelValue.quota" :min="0" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Durasi (jam)</label>
        <InputNumber v-model="modelValue.duration" :min="1" class="w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Paralel</label>
        <InputNumber v-model="modelValue.parallel" :min="1" class="w-full" />
      </div>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Ruangan</h3>
      <MultiSelect
        v-model="modelValue.room_ids"
        :options="roomOptions"
        option-label="label"
        option-value="value"
        filter
        class="w-full"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Tipe Ruangan</h3>
      <MultiSelect
        v-model="modelValue.room_type_ids"
        :options="roomTypeOptions"
        option-label="label"
        option-value="value"
        class="w-full"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Pengajar</h3>
      <MultiSelect
        v-model="modelValue.lecturer_ids"
        :options="lecturerOptions"
        option-label="label"
        option-value="value"
        filter
        class="w-full"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Jarak Hari Minimum</h3>
      <DayGapList v-model="modelValue.day_gaps" :activity-options="activityOptions" />
    </div>
  </div>
</template>
