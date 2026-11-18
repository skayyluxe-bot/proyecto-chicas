import type { MakeupPreference, Occasion, StylePreference } from './types'

export const occasionOptions = [
  { value: 'cumpleanos', label: 'Cumpleaños' },
  { value: 'fiesta', label: 'Fiesta' },
  { value: 'cena_formal', label: 'Cena formal' },
  { value: 'salida_casual', label: 'Salida casual' },
  { value: 'graduacion', label: 'Graduación' },
] as const satisfies ReadonlyArray<{ value: Occasion; label: string }>

export const styleOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'elegante', label: 'Elegante' },
  { value: 'moderno', label: 'Moderno' },
  { value: 'sin_preferencia', label: 'Sin preferencia' },
] as const satisfies ReadonlyArray<{ value: StylePreference; label: string }>

export const makeupOptions = [
  { value: 'natural', label: 'Natural' },
  { value: 'glam', label: 'Glam' },
  { value: 'sin_preferencia', label: 'Sin preferencia' },
] as const satisfies ReadonlyArray<{ value: MakeupPreference; label: string }>
