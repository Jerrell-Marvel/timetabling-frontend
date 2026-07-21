<script setup lang="ts">
/**
 * Read-only view of an Activity and its constraints.
 *
 * Constraints arrive as one flat list and are grouped here for display. Each row
 * already carries a server-resolved `valueLabel`, so no lookup tables are needed.
 */
import { computed } from 'vue'
import type { Activity, ActivityConstraint, ConstraintType } from '@/types'

const props = defineProps<{
  activity: Activity
  constraints: ActivityConstraint[]
  semesterName?: string
}>()

const groups = computed(() => {
  const of = (type: ConstraintType) => props.constraints.filter((c) => c.type === type)
  return {
    lecturers: of('LECTURER'),
    rooms: of('ROOM'),
    roomTypes: of('ROOM_TYPE'),
    paralels: of('PARALEL'),
    gaps: of('GAP'),
  }
})

/** Groups rendered with the same "label + Hard/Soft Constraint tag" markup. */
const taggedGroups = computed(() => [
  { key: 'rooms', title: 'Ruangan', rows: groups.value.rooms },
  { key: 'roomTypes', title: 'Tipe Ruangan', rows: groups.value.roomTypes },
  { key: 'paralels', title: 'Aktivitas Paralel', rows: groups.value.paralels },
])

/** Fall back to the raw value when the target row has since been deleted. */
function label(c: ActivityConstraint): string {
  return c.valueLabel ?? `#${c.value}`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-3">Data Aktivitas</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p class="text-xs text-surface-400">Semester</p>
          <p class="font-medium text-surface-900">{{ semesterName ?? activity.semesterId }}</p>
        </div>
        <div>
          <p class="text-xs text-surface-400">Matakuliah</p>
          <p class="font-medium text-surface-900">
            {{ activity.courseCode }} — {{ activity.courseName }}
          </p>
        </div>
        <div>
          <p class="text-xs text-surface-400">Jenis Aktivitas</p>
          <p class="font-medium text-surface-900">{{ activity.activityTypeName ?? '-' }}</p>
        </div>
        <div>
          <p class="text-xs text-surface-400">Kelas</p>
          <p class="font-medium text-surface-900">{{ activity.courseClass }}</p>
        </div>
        <div>
          <p class="text-xs text-surface-400">Sesi</p>
          <p class="font-medium text-surface-900">{{ activity.courseSession }}</p>
        </div>
        <div>
          <p class="text-xs text-surface-400">Durasi</p>
          <p class="font-medium text-surface-900">{{ activity.duration }} jam</p>
        </div>
        <div>
          <p class="text-xs text-surface-400">Kuota</p>
          <p class="font-medium text-surface-900">{{ activity.quota }}</p>
        </div>
      </div>
    </div>

    <div class="border-t border-surface-200 pt-5">
      <h3 class="text-sm font-semibold text-surface-800 mb-4">Batasan Penjadwalan</h3>

      <div class="flex flex-col gap-4">
        <div>
          <p class="text-xs text-surface-400 mb-1">Pengajar</p>
          <p v-if="!groups.lecturers.length" class="text-sm text-surface-700">-</p>
          <div v-else class="flex flex-wrap gap-1">
            <Tag v-for="c in groups.lecturers" :key="c.id" :value="label(c)" severity="secondary" />
          </div>
        </div>

        <div v-for="group in taggedGroups" :key="group.key">
          <p class="text-xs text-surface-400 mb-1">{{ group.title }}</p>
          <p v-if="!group.rows.length" class="text-sm text-surface-700">-</p>
          <div v-else class="flex flex-wrap gap-3">
            <span
              v-for="c in group.rows"
              :key="c.id"
              class="inline-flex items-center gap-1 text-sm text-surface-700"
            >
              {{ label(c) }}
              <Tag
                :value="c.isHard ? 'Hard Constraint' : 'Soft Constraint'"
                :severity="c.isHard ? 'danger' : 'info'"
              />
            </span>
          </div>
        </div>

        <div>
          <p class="text-xs text-surface-400 mb-1">Jarak Hari Minimum</p>
          <p v-if="!groups.gaps.length" class="text-sm text-surface-700">-</p>
          <div v-else class="flex flex-col gap-1 items-start">
            <span
              v-for="c in groups.gaps"
              :key="c.id"
              class="inline-flex items-center gap-1 text-sm text-surface-700"
            >
              {{ label(c) }} — minimal {{ c.minGap }} hari
              <Tag
                :value="c.isHard ? 'Hard Constraint' : 'Soft Constraint'"
                :severity="c.isHard ? 'danger' : 'info'"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
