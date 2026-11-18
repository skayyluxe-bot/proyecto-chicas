export type Occasion =
  | 'cumpleanos'
  | 'fiesta'
  | 'cena_formal'
  | 'salida_casual'
  | 'graduacion'

export type StylePreference = 'casual' | 'elegante' | 'moderno' | 'sin_preferencia'
export type MakeupPreference = 'natural' | 'glam' | 'sin_preferencia'

export interface ConsultationInput {
  occasion: Occasion
  style: StylePreference
  makeup: MakeupPreference
}

export interface Outfit {
  id: string
  nombre: string
  descripcion: string
  ocasiones: Occasion[]
  estilos: Exclude<StylePreference, 'sin_preferencia'>[]
  prendas: string[]
  imagen: string
  makeupIds: string[]
}

export interface Makeup {
  id: string
  nombre: string
  descripcion: string
  ocasiones: Occasion[]
  intensidad: Exclude<MakeupPreference, 'sin_preferencia'>
  imagen: string
}
