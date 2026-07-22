import { createResource } from './resource'
import type { Id, Konsentrasi, KonsentrasiDraft, KonsentrasiPayload } from '@/types'

const resource = createResource<Konsentrasi, KonsentrasiPayload>('konsentrasi')

/**
 * `/api/konsentrasi` (`KonsentrasiController`). Writes are
 * `@PreAuthorize("hasRole('ADMIN')")`, matching the Jurusan resource that owns them.
 */
export const konsentrasiService = {
  ...resource,

  /** `GET /api/konsentrasi?jurusanId=3` */
  listByJurusan: (jurusanId: Id) => resource.list({ jurusanId }),

  /**
   * Reconcile a jurusan's concentrations against the list as last loaded.
   *
   * Laravel rewrote the whole set on every Prodi save (delete-all then re-insert),
   * which regenerated every row id. Diffing instead keeps ids stable for untouched
   * rows — the same approach `lecturersService.save` uses for availability times.
   *
   * - draft without `id`         → POST
   * - draft with `id`            → PUT (only when the text actually changed)
   * - loaded id no longer listed → DELETE
   *
   * Deletes run first: the backend refuses to delete a concentration still assigned
   * to a course, and running them ahead of the creates keeps that error attributable.
   */
  async reconcile(
    jurusanId: Id,
    drafts: KonsentrasiDraft[],
    original: Konsentrasi[],
  ): Promise<void> {
    const desired = drafts
      .map((d) => ({ ...d, konsentrasi: d.konsentrasi.trim() }))
      .filter((d) => d.konsentrasi !== '')

    const keptIds = new Set(desired.map((d) => d.id).filter((v): v is Id => v !== undefined))
    const byId = new Map(original.map((k) => [k.id, k]))

    const toDelete = original.filter((k) => !keptIds.has(k.id))
    const toCreate = desired.filter((d) => d.id === undefined)
    const toUpdate = desired.filter(
      (d) => d.id !== undefined && byId.get(d.id)?.konsentrasi !== d.konsentrasi,
    )

    await Promise.all(toDelete.map((k) => resource.destroy(k.id)))
    await Promise.all([
      ...toUpdate.map((d) => resource.update(d.id!, { jurusanId, konsentrasi: d.konsentrasi })),
      ...toCreate.map((d) => resource.create({ jurusanId, konsentrasi: d.konsentrasi })),
    ])
  },
}
