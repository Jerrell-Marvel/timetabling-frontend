<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import ActivityDetail from '@/components/activities/ActivityDetail.vue'
import { activitiesService, activityConstraintsService, semestersService } from '@/services'
import { semesterLabel } from '@/types'
import type { Activity, ActivityConstraint } from '@/types'

const route = useRoute()
const router = useRouter()
const activity = ref<Activity | null>(null)
const constraints = ref<ActivityConstraint[]>([])
const semesterName = ref<string>()

onMounted(async () => {
  const id = Number(route.params.id)

  // The activity response already carries course/type names, and each constraint
  // carries a resolved `valueLabel` — so two requests cover the whole page.
  const [data, constraintRows] = await Promise.all([
    activitiesService.get(id),
    activityConstraintsService.byActivity(id),
  ])
  activity.value = data
  constraints.value = constraintRows

  const semester = await semestersService.get(data.semesterId)
  semesterName.value = semesterLabel(semester)
})
</script>

<template>
  <CRUPage page="Aktivitas" type="Detil" url="/activities">
    <div class="flex justify-end mb-4">
      <Button
        label="Edit"
        icon="pi pi-pencil"
        @click="router.push({ name: 'activities.edit', params: { id: route.params.id } })"
      />
    </div>
    <ActivityDetail
      v-if="activity"
      :activity="activity"
      :constraints="constraints"
      :semester-name="semesterName"
    />
  </CRUPage>
</template>
