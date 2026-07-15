import { reactive, ref } from 'vue'
import { isValidationError } from '@/lib/api'

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

  function setErrors(bag: Record<string, string[]>): void {
    clearErrors()
    for (const [field, messages] of Object.entries(bag)) {
      const first = messages?.[0]
      if (first) errors[field] = first
    }
  }

  async function submit<T>(request: () => Promise<T>): Promise<T> {
    processing.value = true
    clearErrors()
    try {
      return await request()
    } catch (error) {
      if (isValidationError(error) && error.response?.data.errors) {
        setErrors(error.response.data.errors)
      }
      throw error
    } finally {
      processing.value = false
    }
  }

  return { errors, processing, submit, clearErrors, setErrors }
}
