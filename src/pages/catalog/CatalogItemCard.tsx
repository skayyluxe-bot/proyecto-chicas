import { Card } from '../../components/Card'
import type { Makeup, Outfit } from '../../domain/types'

export type CatalogEntry = { kind: 'outfit'; item: Outfit } | { kind: 'makeup'; item: Makeup }

export function CatalogItemCard({ entry }: { entry: CatalogEntry }) {
  const { item } = entry
  return <Card>
    <img src={item.imagen} alt={`Referencia visual generada con IA: ${item.nombre}`} loading="lazy" width={480} height={360}
      style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }} />
    <p className="eyebrow">{entry.kind === 'outfit' ? 'Outfit' : entry.item.intensidad === 'glam' ? 'Maquillaje glam' : 'Maquillaje natural'}</p>
    <h2>{item.nombre}</h2>
    <p>{item.descripcion}</p>
    {entry.kind === 'outfit' && <><h3>Prendas</h3><ul>{entry.item.prendas.map(prenda => <li key={prenda}>{prenda}</li>)}</ul></>}
    <p className="muted">Referencia visual generada con IA</p>
  </Card>
}
