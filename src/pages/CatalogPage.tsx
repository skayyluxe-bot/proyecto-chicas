import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { outfits } from '../data/outfits'
import { makeups } from '../data/makeups'
import { CatalogItemCard } from './catalog/CatalogItemCard'
import type { CatalogEntry } from './catalog/CatalogItemCard'

const entries: CatalogEntry[] = [
  ...outfits.map(item => ({ kind: 'outfit' as const, item })),
  ...makeups.map(item => ({ kind: 'makeup' as const, item })),
]
function searchable(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
}

export function CatalogPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const query = searchable(search)
  const visibleEntries = entries.filter(entry => (category === 'all' || entry.kind === category) &&
    searchable(`${entry.item.nombre} ${entry.item.descripcion}`).includes(query))

  return <>
    <p className="eyebrow">Tu próxima inspiración</p>
    <h1>Catálogo</h1>
    <p>Explora 15 outfits y 10 estilos de maquillaje. Las ilustraciones son referencias generales; en cada descripción encontrarás los detalles de la propuesta.</p>
    <Card>
      <div role="search" aria-label="Buscar en el catálogo">
        <label htmlFor="catalog-search">Buscar por nombre o descripción</label>
        <input id="catalog-search" type="search" placeholder="Por ejemplo: satinado, natural, graduación…" value={search} onChange={event => setSearch(event.target.value)} />
        <p><label htmlFor="catalog-category">Categoría</label>
          <select id="catalog-category" value={category} onChange={event => setCategory(event.target.value)}>
            <option value="all">Todas las categorías</option>
            <option value="outfit">Outfits</option>
            <option value="makeup">Maquillajes</option>
          </select>
        </p>
      </div>
      {(search || category !== 'all') && <Button variant="secondary" onClick={() => { setSearch(''); setCategory('all') }}>Limpiar filtros</Button>}
    </Card>
    <p role="status">{visibleEntries.length} {visibleEntries.length === 1 ? 'opción encontrada' : 'opciones encontradas'}.</p>
    {visibleEntries.length ? <ul className="steps" aria-label="Opciones del catálogo" style={{ listStyle: 'none', padding: 0 }}>
      {visibleEntries.map(entry => <li key={`${entry.kind}-${entry.item.id}`}><CatalogItemCard entry={entry} /></li>)}
    </ul> : <Card><h2>No encontramos coincidencias</h2><p>Prueba con otro nombre o descripción, cambia de categoría o limpia los filtros.</p></Card>}
    <p><Link to="/">Volver al inicio</Link></p>
  </>
}
