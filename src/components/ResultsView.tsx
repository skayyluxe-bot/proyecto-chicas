import type { Makeup, Outfit } from '../domain/types'
import { Card } from './Card'

interface ResultsViewProps {
  outfits: Outfit[]
  makeups: Makeup[]
}

const referenceImageStyle = { width: '100%', aspectRatio: '4 / 3', objectFit: 'contain' as const, borderRadius: 'var(--radius)' }

export function ResultsView({ outfits, makeups }: ResultsViewProps) {
  return <>
    <section aria-labelledby="outfit-results-title">
      <h2 id="outfit-results-title">Outfits para tu ocasión</h2>
      {outfits.length === 0 ? <Card><p>No hay outfits para mostrar. Puedes cambiar tus preferencias o explorar el catálogo.</p></Card> :
        <div className="steps">{outfits.map(outfit => <Card key={outfit.id}>
          <img src={outfit.imagen} alt={`Referencia visual generada con IA de vestimenta: ${outfit.nombre}`} style={referenceImageStyle} />
          <p className="muted">Referencia visual generada con IA</p>
          <h3>{outfit.nombre}</h3>
          <p>{outfit.descripcion}</p>
          <h4>Prendas del conjunto</h4>
          <ul>{outfit.prendas.map(prenda => <li key={prenda}>{prenda}</li>)}</ul>
        </Card>)}</div>}
    </section>
    <section aria-labelledby="makeup-results-title">
      <h2 id="makeup-results-title">Maquillajes para acompañarte</h2>
      {makeups.length === 0 ? <Card><p>No hay maquillajes para mostrar. Puedes cambiar tus preferencias o explorar el catálogo.</p></Card> :
        <div className="steps">{makeups.map(makeup => <Card key={makeup.id}>
          <img src={makeup.imagen} alt={`Referencia visual generada con IA de maquillaje: ${makeup.nombre}`} style={referenceImageStyle} />
          <p className="muted">Referencia visual generada con IA · {makeup.intensidad === 'glam' ? 'Glam' : 'Natural'}</p>
          <h3>{makeup.nombre}</h3>
          <p>{makeup.descripcion}</p>
        </Card>)}</div>}
    </section>
  </>
}
