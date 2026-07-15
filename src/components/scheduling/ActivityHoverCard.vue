<script setup lang="ts">
/**
 * Pointer-positioned activity summary shown while hovering a placed cell in
 * read-only render mode. Replaces `CourseHoverComponent`.
 */
import type { ScheduleActivity } from '@/types'

defineProps<{
  activity: ScheduleActivity | null
  x: number
  y: number
}>()
</script>

<template>
  <div
    v-if="activity"
    class="fixed z-[1100] w-80 rounded-2xl border border-surface-100 bg-white shadow-lg p-4 pointer-events-none"
    :style="{ left: `${x + 20}px`, top: `${y}px` }"
  >
    <h4 class="text-base font-bold text-surface-900">{{ activity.course.name }}</h4>
    <p class="text-xs text-surface-400 tracking-wide mt-0.5">
      {{ activity.course.code }} ({{ activity.course_class }} Sesi {{ activity.course_session }})
    </p>
    <hr class="my-2 border-surface-100" />
    <div class="grid grid-cols-2 gap-3 text-sm">
      <div>
        <span class="font-semibold text-surface-700">Ruang</span>
        <p v-for="r in activity.activity_rooms" :key="r.room_code" class="text-surface-600">
          {{ r.room_code }}
        </p>
      </div>
      <div>
        <span class="font-semibold text-surface-700">Tipe Ruang</span>
        <p v-for="t in activity.activity_room_types" :key="t.id" class="text-surface-600">
          {{ t.name }}
        </p>
      </div>
    </div>
    <div class="text-sm mt-3">
      <span class="font-semibold text-surface-700">Kapasitas</span>
      <span class="text-surface-600"> : {{ activity.quota }}</span>
    </div>
    <div class="text-sm mt-3">
      <span class="font-semibold text-surface-700">Pengajar</span>
      <p v-for="l in activity.activity_lecturers" :key="l.nik" class="text-surface-600">
        {{ l.name }}
      </p>
    </div>
  </div>
</template>
