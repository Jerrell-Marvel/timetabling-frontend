/**
 * Shared primitives used across every domain DTO and service module.
 */

export type Id = number

/** Laravel validation-error envelope: `{ message, errors: { field: [msg, ...] } }`. */
export interface ValidationErrorBody {
  message: string
  errors: Record<string, string[]>
}

/** Single-resource envelope returned by Laravel API Resources (`{ data: {...} }`). */
export interface ResourceEnvelope<T> {
  data: T
}

/** Paginated collection envelope (`{ data: [...], meta, links }`). */
export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}

/** A field/value option for `Select` / `MultiSelect` controls. */
export interface Option<V = Id> {
  label: string
  value: V
}
