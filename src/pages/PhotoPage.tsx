import { Link } from 'react-router-dom'
import { Card } from '../components/Card'

export function PhotoPage() {
  return <Card>
    <p className="eyebrow">Tu consulta · Paso 2</p>
    <h1>Fotografía opcional</h1>
    <p>El selector de galería y cámara se incorporará en la fase 2.</p>
    <p>La fotografía es solo una referencia visual; esta versión no analiza imágenes.</p>
    <div className="actions"><Link className="button button--secondary" to="/ocasion">Volver a preferencias</Link><Link to="/resultados">Ver la pantalla de resultados</Link></div>
  </Card>
}
