import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useConsultation } from '../state/ConsultationContext'

export function ResultsPage() {
  const { reset } = useConsultation()
  const navigate = useNavigate()
  return <Card>
    <p className="eyebrow">Tu consulta · Paso 3</p>
    <h1>Tus recomendaciones</h1>
    <p>Aquí encontrarás las combinaciones de outfits y maquillaje. Las recomendaciones estarán disponibles cuando se integren los motores en la fase 3.</p>
    <div className="actions">
      <Link className="button button--secondary" to="/ocasion">Cambiar preferencias</Link>
      <Button onClick={() => { reset(); navigate('/ocasion') }}>Nueva consulta</Button>
    </div>
  </Card>
}
