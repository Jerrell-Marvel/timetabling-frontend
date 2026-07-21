import api from '@/lib/api'
import type { ActivityConstraint, ConstraintType, Id } from '@/types'

/** One row as the bulk endpoint accepts it — no `activityId`, it comes from the path. */
export interface ActivityConstraintItem {
  type: ConstraintType
  value: string
  isHard: boolean
  minGap?: number | null
}

/**
 * `activity_constraints` — lecturers, rooms, room types, paralels and gaps, all
 * in one table.
 *
 * Most callers should go through `activitiesService.saveForm` / `loadForm`
 * rather than these endpoints directly; this module exists so that composition
 * has something to build on.
 */
export const activityConstraintsService = {
  byActivity: (activityId: Id) =>
    api
      .get<ActivityConstraint[]>('/activity-constraints', { params: { activityId } })
      .then((r) => r.data),

  /**
   * Replace an activity's entire constraint set in one transaction. Pass `[]` to
   * clear. Mirrors the legacy delete-all-then-reinsert, and keeps the form save
   * atomic — a failure leaves the previous set intact rather than half-applied.
   */
  replaceForActivity: (activityId: Id, constraints: ActivityConstraintItem[]) =>
    api
      .put<ActivityConstraint[]>(`/activity-constraints/activity/${activityId}`, { constraints })
      .then((r) => r.data),

  destroy: (id: Id) => api.delete<void>(`/activity-constraints/${id}`).then((r) => r.data),
}
