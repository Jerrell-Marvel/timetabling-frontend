import { reactive, ref } from 'vue'
import { isValidationError } from '@/lib/api'
import type { ApiFieldError } from '@/types'

/**
 * Form submit + 422 field-error mapping. Consumed by every resource form to
 * render field-level `Message`s (replaces Blade inline `@error`).
 *
 * `errors` is keyed by field name and holds the first server message per field.
 * `submit` runs the request, clears prior errors, maps 422 into `errors`, and
 * rethrows so the caller can branch on other failures.
 */
export function useApiForm() {
  const errors = reactive<Record<string, string>>({})
  const processing = ref(false)

  function clearErrors(): void {
    for (const key of Object.keys(errors)) delete errors[key]
  }

  /** Map Spring's `fieldErrors` array, keeping the first message per field. */
  function setErrors(fieldErrors: ApiFieldError[]): void {
    clearErrors()
    for (const { field, message } of fieldErrors) {
      if (field && message && !(field in errors)) errors[field] = message
    }
  }

  async function submit<T>(request: () => Promise<T>): Promise<T> {
    processing.value = true
    clearErrors()
    try {
      return await request()
    } catch (error) {
      const fieldErrors = error && isValidationError(error) ? error.response?.data.fieldErrors : undefined
      if (fieldErrors?.length) {
        setErrors(fieldErrors)
      }
      throw error
    } finally {
      processing.value = false
    }
  }

  return { errors, processing, submit, clearErrors, setErrors }
}
