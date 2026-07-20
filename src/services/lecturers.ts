import { createResource, download, upload } from './resource'
import { lecturerTimesService } from './lecturerTimes'
import type { Id, Lecturer, LecturerPayload, LecturerTime } from '@/types'

const resource = createResource<Lecturer, LecturerPayload>('lecturers')

/** `resource('lecturers')` + Excel template/download + two import types. */
export const lecturersService = {
  ...resource,

  // Downloads (Excel templates / exports)
  excelLecturer: () => download('/excel-lecturer'),
  excelLecturerTime: () => download('/excel-lecturer-time'),

  // Two import types: base lecturers, and lecturer time constraints
  uploadLecturer: (file: File) => upload('/uploads-lecturer', file),
  uploadLecturerTime: (file: File) => upload('/uploads-lecturer-time', file),

  /**
   * Save a lecturer *and* its availability in one call.
   *
   * The backend splits these across two controllers: `LecturerRequest` carries
   * only the core profile, while each time row is its own `/lecturer-times`
   * resource. So we persist the profile first (on create, to obtain the `id`
   * every time row needs as `lecturerId`), then reconcile the rows:
   *
   * - row without `id`            → POST (new)
   * - row with `id`               → PUT  (edited in place)
   * - `original` id now absent    → DELETE (removed in the UI)
   *
   * @param id       `null` to create, otherwise the lecturer being edited.
   * @param form     current form state (both time groups).
   * @param original the time rows as last loaded from the server; used only to
   *                 detect deletions, so it is empty on create.
   */
  async save(id: Id | null, form: Lecturer, original: LecturerTime[] = []): Promise<Lecturer> {
    const payload: LecturerPayload = {
      nik: form.nik,
      name: form.name,
      homeBase: form.homeBase,
      alias: form.alias ?? null,
    }

    // 1. Core profile first — a create must yield the id the time rows need.
    const saved = id === null ? await resource.create(payload) : await resource.update(id, payload)
    const lecturerId = saved.id
    if (lecturerId === undefined) return saved

    // 2. Reconcile availability. Each row already carries its own `type`, set by
    //    TimeRangeList, so the two groups can simply be concatenated.
    const desired = [...(form.notAvailable ?? []), ...(form.priority ?? [])]
    const keptIds = new Set(desired.map((t) => t.id).filter((v): v is Id => v !== undefined))

    const toDelete = original.filter((t) => t.id !== undefined && !keptIds.has(t.id))
    const toCreate = desired.filter((t) => t.id === undefined)
    const toUpdate = desired.filter((t) => t.id !== undefined)

    await Promise.all([
      ...toDelete.map((t) => lecturerTimesService.destroy(t.id!)),
      ...toUpdate.map((t) =>
        lecturerTimesService.update(t.id!, {
          lecturerId,
          day: t.day,
          startTime: t.startTime,
          endTime: t.endTime,
          type: t.type,
        }),
      ),
      ...toCreate.map((t) =>
        lecturerTimesService.create({
          lecturerId,
          day: t.day,
          startTime: t.startTime,
          endTime: t.endTime,
          type: t.type,
        }),
      ),
    ])

    return saved
  },
}
