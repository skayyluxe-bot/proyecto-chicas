import { Link } from 'react-router-dom'
import { Card } from '../components/Card'

export function OccasionPage() {
  return <Card>
    <p className="eyebrow">Tu consulta · Paso 1</p>
    <h1>Ocasión y preferencias</h1>
    <p>Próximamente podrás elegir la ocasión, el estilo de ropa y la intensidad del maquillaje. El formulario se incorporará en la fase 2.</p>
    <div className="actions"><Link className="button button--secondary" to="/">Volver al inicio</Link><Link to="/foto">Ver el paso de fotografía</Link></div>
  </Card>
}
