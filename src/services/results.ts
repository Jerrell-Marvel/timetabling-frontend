import { createResource, download, upload } from './resource'
import type { Id, Result } from '@/types'

/** `resource('results')` + SIAKAD export / printable download / updated-import. */
export const resultsService = {
  ...createResource<Result>('results'),

  exportSiakad: (id: Id) => download(`/export-siakad/${id}`),
  downloadPrint: (id: Id) => download(`/download-print/${id}`),
  uploadUpdate: (file: File) => upload('/uploads-excel-result-update', file),
}
