/**
 * Shared primitives used across every domain DTO and service module.
 */

export type Id = number

/** Laravel validation-error envelope: `{ message, errors: { field: [msg, ...] } }`. */
export interface ValidationErrorBody {
  message: string
  errors: Record<string, string[]>
}

/** A field/value option for `Select` / `MultiSelect` controls. */
export interface Option<V = Id> {
  label: string
  value: V
}
