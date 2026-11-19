import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ResultsView } from '../components/ResultsView'
import { useConsultation } from '../state/ConsultationContext'

export function ResultsPage() {
  const { reset } = useConsultation()
  const navigate = useNavigate()
  return <>
    <Card>
    <p className="eyebrow">Tu consulta · Paso 3</p>
    <h1>Tus recomendaciones</h1>
    <p>Las recomendaciones personalizadas estarán disponibles próximamente. Mientras tanto, puedes explorar todas las opciones en el catálogo.</p>
    <div className="actions">
      <Link className="button button--secondary" to="/ocasion">Cambiar preferencias</Link>
      <Button onClick={() => { reset(); navigate('/ocasion') }}>Nueva consulta</Button>
      <Link to="/catalogo">Explorar el catálogo</Link>
    </div>
    </Card>
    <ResultsView outfits={[]} makeups={[]} />
  </>
}
