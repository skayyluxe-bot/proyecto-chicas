import { describe, expect, it } from 'vitest'
import { makeups } from '../data/makeups'
import { outfits } from '../data/outfits'
import { occasionOptions } from './options'
import { recommendMakeup } from './recommendMakeup'
import type { ConsultationInput, Makeup } from './types'

const criteria: ConsultationInput = { occasion: 'fiesta', style: 'elegante', makeup: 'natural' }
function makeup(id: string, patch: Partial<Makeup> = {}): Makeup {
  return { id, nombre: id, descripcion: '', ocasiones: ['fiesta'], intensidad: 'glam', imagen: '', ...patch }
}
const ids = (items: Makeup[]) => items.map(item => item.id)
const selectedOutfit = { ...outfits[0], makeupIds: ['related', 'both', 'wrong-occasion'] }

describe('recommendMakeup', () => {
  it('filtra por ocasión incluso si el maquillaje está relacionado', () => {
    expect(ids(recommendMakeup(criteria, [makeup('valid'), makeup('wrong-occasion', { ocasiones: ['graduacion'] })], selectedOutfit))).toEqual(['valid'])
  })
  it('suma dos puntos por preferencia y tres por relación con el outfit', () => {
    const catalog = [makeup('unrelated'), makeup('preferred', { intensidad: 'natural' }), makeup('related'), makeup('both', { intensidad: 'natural' })]
    expect(ids(recommendMakeup(criteria, catalog, selectedOutfit))).toEqual(['both', 'related', 'preferred'])
  })
  it('funciona sin outfit y prioriza la intensidad solicitada', () => {
    expect(ids(recommendMakeup(criteria, [makeup('a'), makeup('b', { intensidad: 'natural' })]))).toEqual(['b', 'a'])
  })
  it('sin preferencia sigue priorizando la relación con el outfit', () => {
    expect(ids(recommendMakeup({ ...criteria, makeup: 'sin_preferencia' }, [makeup('a', { intensidad: 'natural' }), makeup('related')], selectedOutfit))).toEqual(['related', 'a'])
  })
  it('desempata por ID ascendente y limita a tres', () => {
    expect(ids(recommendMakeup(criteria, ['d', 'b', 'c', 'a'].map(id => makeup(id))))).toEqual(['a', 'b', 'c'])
  })
  it('devuelve vacío sin coincidencias o sin catálogo', () => {
    expect(recommendMakeup(criteria, [])).toEqual([])
    expect(recommendMakeup(criteria, [makeup('a', { ocasiones: ['cumpleanos'] })])).toEqual([])
  })
  it('es determinista y no modifica catálogo, criterios ni outfit', () => {
    const catalog = [makeup('b'), makeup('a')]
    const before = structuredClone({ criteria, catalog, selectedOutfit })
    Object.freeze(catalog)
    for (const item of catalog) Object.freeze(item)
    Object.freeze(selectedOutfit)
    expect(recommendMakeup(criteria, catalog, selectedOutfit)).toEqual(recommendMakeup(criteria, catalog, selectedOutfit))
    expect({ criteria, catalog, selectedOutfit }).toEqual(before)
  })
  it.each(occasionOptions)('el catálogo ofrece dos maquillajes para $label', ({ value }) => {
    const result = recommendMakeup({ ...criteria, occasion: value }, makeups)
    expect(result).toHaveLength(2)
    expect(result.every(item => item.ocasiones.includes(value))).toBe(true)
  })
})
