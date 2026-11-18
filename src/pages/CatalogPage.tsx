import { Link } from 'react-router-dom'
import { Card } from '../components/Card'

export function CatalogPage() {
  return <Card>
    <p className="eyebrow">Tu próxima inspiración</p>
    <h1>Catálogo</h1>
    <p>Próximamente podrás explorar prendas y estilos de maquillaje. El catálogo, sus imágenes, búsquedas y filtros se incorporarán en la fase 2.</p>
    <div className="actions"><Link className="button button--secondary" to="/">Volver al inicio</Link></div>
  </Card>
}
