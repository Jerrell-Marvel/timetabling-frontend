import type { Id } from './common'

/** Study program (`prodis`): name/faculty/degree, a display colour, and concentrations. */
export interface Prodi {
  id?: Id
  name: string
  faculty: string
  degree: string
  color: string
  concentrations: string[]
}
