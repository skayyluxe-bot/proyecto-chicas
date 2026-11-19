import type { ConsultationInput, Outfit } from './types'

export function recommendOutfits(criteria: ConsultationInput, catalog: Outfit[]): Outfit[] {
  return catalog
    .filter(outfit => outfit.ocasiones.includes(criteria.occasion))
    .map(outfit => ({
      outfit,
      score: criteria.style !== 'sin_preferencia' && outfit.estilos.includes(criteria.style) ? 2 : 0,
    }))
    .sort((a, b) => b.score - a.score || (a.outfit.id < b.outfit.id ? -1 : a.outfit.id > b.outfit.id ? 1 : 0))
    .slice(0, 3)
    .map(result => result.outfit)
}
