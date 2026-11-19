import { describe, expect, it } from 'vitest'
import { outfits } from '../data/outfits'
import { occasionOptions } from './options'
import { recommendOutfits } from './recommendOutfits'
import type { ConsultationInput, Outfit } from './types'

const criteria: ConsultationInput = { occasion: 'fiesta', style: 'elegante', makeup: 'natural' }
function outfit(id: string, patch: Partial<Outfit> = {}): Outfit {
  return { id, nombre: id, descripcion: '', ocasiones: ['fiesta'], estilos: ['casual'], prendas: [], imagen: '', makeupIds: [], ...patch }
}
const ids = (items: Outfit[]) => items.map(item => item.id)

describe('recommendOutfits', () => {
  it('filtra por ocasión y prioriza el estilo sin excluir los otros estilos', () => {
    const catalog = [outfit('a'), outfit('b', { estilos: ['elegante'] }), outfit('c', { ocasiones: ['graduacion'], estilos: ['elegante'] })]
    expect(ids(recommendOutfits(criteria, catalog))).toEqual(['b', 'a'])
  })
  it('desempata por ID ascendente y limita a tres', () => {
    expect(ids(recommendOutfits(criteria, ['d', 'b', 'a', 'c'].map(id => outfit(id))))).toEqual(['a', 'b', 'c'])
  })
  it('sin preferencia ordena por ID aunque haya estilos elegantes', () => {
    expect(ids(recommendOutfits({ ...criteria, style: 'sin_preferencia' }, [outfit('b', { estilos: ['elegante'] }), outfit('a')]))).toEqual(['a', 'b'])
  })
  it('devuelve vacío para catálogos vacíos o sin coincidencias', () => {
    expect(recommendOutfits(criteria, [])).toEqual([])
    expect(recommendOutfits(criteria, [outfit('a', { ocasiones: ['cumpleanos'] })])).toEqual([])
  })
  it('es determinista y no modifica el catálogo ni sus objetos', () => {
    const catalog = [outfit('b'), outfit('a')]
    const before = structuredClone(catalog)
    Object.freeze(catalog)
    for (const item of catalog) Object.freeze(item)
    expect(recommendOutfits(criteria, catalog)).toEqual(recommendOutfits(criteria, catalog))
    expect(catalog).toEqual(before)
  })
  it.each(occasionOptions)('el catálogo ofrece tres outfits para $label', ({ value }) => {
    const result = recommendOutfits({ ...criteria, occasion: value }, outfits)
    expect(result).toHaveLength(3)
    expect(result.every(item => item.ocasiones.includes(value))).toBe(true)
  })
})
