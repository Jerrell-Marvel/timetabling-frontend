/**
 * Shared primitives used across every domain DTO and service module.
 */

export type Id = number

/** A single field-level failure inside {@link ValidationErrorBody}. */
export interface ApiFieldError {
  field: string
  message: string
  rejectedValue?: unknown
}

/**
 * Spring's `ErrorResponse` envelope (`GlobalExceptionHandler`). Bean-validation
 * failures come back as **422** carrying `fieldErrors`; every other handled
 * error carries just `message`.
 */
export interface ValidationErrorBody {
  success?: boolean
  status?: number
  error?: string
  message: string
  path?: string
  timestamp?: string
  fieldErrors?: ApiFieldError[]
}

/** A field/value option for `Select` / `MultiSelect` controls. */
export interface Option<V = Id> {
  label: string
  value: V
}
