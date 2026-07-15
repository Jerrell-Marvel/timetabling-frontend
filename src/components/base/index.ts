/** Barrel for the shared, config-driven base components. */
export { default as ResourceListLayout } from './ResourceListLayout.vue'
export { default as ResourceTable } from './ResourceTable.vue'
export { default as ImportDialog } from './ImportDialog.vue'
export { default as DownloadMenu } from './DownloadMenu.vue'
export { default as ConfirmActionDialog } from './ConfirmActionDialog.vue'
export { default as LoadingOverlay } from './LoadingOverlay.vue'

export type { ResourceColumn, ResourceAction } from './ResourceTable.vue'
export type { ImportEndpoint } from './ImportDialog.vue'
export type { DownloadItem } from './DownloadMenu.vue'
export type { ConfirmActionOptions } from './ConfirmActionDialog.vue'
