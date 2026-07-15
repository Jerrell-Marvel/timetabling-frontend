import type { Id } from './common'

/** Academic semester. One semester is flagged `is_current`. */
export interface Semester {
  id?: Id
  name: string
  year?: string
  is_current?: boolean
}
