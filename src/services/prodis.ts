import { createResource } from './resource'
import type { Prodi } from '@/types'

/** `resource('prodis')`. */
export const prodisService = createResource<Prodi>('prodis')
