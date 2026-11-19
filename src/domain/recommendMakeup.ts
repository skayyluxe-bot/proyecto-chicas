import type { ConsultationInput, Makeup, Outfit } from './types'

export function recommendMakeup(criteria: ConsultationInput, catalog: Makeup[], selectedOutfit?: Outfit): Makeup[] {
  return catalog
    .filter(makeup => makeup.ocasiones.includes(criteria.occasion))
    .map(makeup => ({
      makeup,
      score: (criteria.makeup === makeup.intensidad ? 2 : 0) + (selectedOutfit?.makeupIds.includes(makeup.id) ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score || (a.makeup.id < b.makeup.id ? -1 : a.makeup.id > b.makeup.id ? 1 : 0))
    .slice(0, 3)
    .map(result => result.makeup)
}
