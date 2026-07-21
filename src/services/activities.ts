import api from '@/lib/api'
import { createResource, download, upload } from './resource'
import { activityConstraintsService, type ActivityConstraintItem } from './activityConstraints'
import { emptyActivityForm } from '@/types'
import type {
  Activity,
  ActivityConstraint,
  ActivityFormModel,
  ActivityPayload,
  ConstraintChoice,
  ConstraintType,
  GapChoice,
  Id,
} from '@/types'

/**
 * Activity master data, plus the composition layer that hides the
 * activity/constraint split from the views.
 *
 * The backend deliberately keeps `activities` free of constraint columns — the
 * lecturer/room/roomType/paralel/gap picks are rows in `activity_constraints`.
 * The user, however, still fills in one form. `saveForm` and `loadForm` are the
 * seam where those two facts meet: everything above them sees a single flat
 * {@link ActivityFormModel}.
 */
export const activitiesService = {
  ...createResource<Activity, ActivityPayload>('activities'),

  bySemester: (semesterId: Id) =>
    api.get<Activity[]>(`/activities/semester/${semesterId}`).then((r) => r.data),

  excelActivities: () => download('/excel-activities'),

  // Two import types: per-activity data, and the combined "all activity" excel
  uploadActivities: (file: File) => upload('/uploads-activities', file),
  uploadAllActivity: (file: File) => upload('/AllActivityExcel', file),

  /**
   * Load an activity and its constraints, flattened into one form model. Both
   * requests run in parallel — the constraint set does not depend on the body.
   */
  async loadForm(id: Id): Promise<ActivityFormModel> {
    const [activity, constraints] = await Promise.all([
      activitiesService.get(id),
      activityConstraintsService.byActivity(id),
    ])
    return toFormModel(activity, constraints)
  },

  /**
   * Save the flat form as an activity + its constraint set.
   *
   * Order matters: the activity must exist before constraints can reference it,
   * so on create we POST first and use the returned id. The constraint write is
   * a single atomic replace, so the worst failure mode is "activity saved,
   * constraints unchanged" — never a partially-written constraint set.
   */
  async saveForm(model: ActivityFormModel, id?: Id | null): Promise<Activity> {
    const payload = toActivityPayload(model)
    const activity = id
      ? await activitiesService.update(id, payload)
      : await activitiesService.create(payload)

    await activityConstraintsService.replaceForActivity(activity.id!, toConstraintItems(model))
    return activity
  },
}

// ── Mapping: flat form model ⇄ the two APIs ─────────────────────────────────

/** Strip the constraint buckets, leaving exactly what `ActivityRequest` accepts. */
export function toActivityPayload(model: ActivityFormModel): ActivityPayload {
  return {
    semesterId: model.semesterId,
    courseId: model.courseId,
    courseClass: model.courseClass,
    courseSession: model.courseSession,
    duration: model.duration,
    quota: model.quota,
    activityTypeId: model.activityTypeId,
  }
}

/**
 * Flatten the five buckets into the wire format. Lecturers are always sent hard
 * — the backend forces it anyway, so sending anything else would just invite
 * confusion when the response comes back different from what was posted.
 */
export function toConstraintItems(model: ActivityFormModel): ActivityConstraintItem[] {
  const rows = (type: ConstraintType, choices: ConstraintChoice[]): ActivityConstraintItem[] =>
    choices
      .filter((c) => c.value !== '' && c.value != null)
      .map((c) => ({ type, value: String(c.value), isHard: c.isHard }))

  return [
    ...model.lecturerNiks
      .filter(Boolean)
      .map((nik) => ({ type: 'LECTURER' as const, value: String(nik), isHard: true })),
    ...rows('ROOM', model.rooms),
    ...rows('ROOM_TYPE', model.roomTypes),
    ...rows('PARALEL', model.paralels),
    ...model.gaps
      .filter((g) => g.value !== '' && g.value != null)
      .map((g) => ({
        type: 'GAP' as const,
        value: String(g.value),
        isHard: g.isHard,
        minGap: g.minGap,
      })),
  ]
}

/** Regroup a flat constraint list back into the form's five buckets. */
export function toFormModel(
  activity: Activity,
  constraints: ActivityConstraint[],
): ActivityFormModel {
  const of = (type: ConstraintType) => constraints.filter((c) => c.type === type)
  const choices = (type: ConstraintType): ConstraintChoice[] =>
    of(type).map((c) => ({ value: c.value, isHard: c.isHard }))

  return {
    ...emptyActivityForm(),
    semesterId: activity.semesterId,
    courseId: activity.courseId,
    courseClass: activity.courseClass,
    courseSession: activity.courseSession,
    duration: activity.duration,
    quota: activity.quota,
    activityTypeId: activity.activityTypeId,
    lecturerNiks: of('LECTURER').map((c) => c.value),
    rooms: choices('ROOM'),
    roomTypes: choices('ROOM_TYPE'),
    paralels: choices('PARALEL'),
    gaps: of('GAP').map<GapChoice>((c) => ({
      value: c.value,
      isHard: c.isHard,
      minGap: c.minGap ?? 1,
    })),
  }
}
