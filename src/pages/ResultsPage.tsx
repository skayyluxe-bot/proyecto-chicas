import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ResultsView } from '../components/ResultsView'
import { makeups } from '../data/makeups'
import { outfits } from '../data/outfits'
import { recommendMakeup } from '../domain/recommendMakeup'
import { recommendOutfits } from '../domain/recommendOutfits'
import type { ConsultationInput } from '../domain/types'
import { useConsultation } from '../state/ConsultationContext'

export function ResultsPage() {
  const { criteria, reset } = useConsultation()
  const navigate = useNavigate()

  if (!criteria.occasion) return <Navigate to="/ocasion" replace />

  const input: ConsultationInput = {
    occasion: criteria.occasion,
    style: criteria.style ?? 'sin_preferencia',
    makeup: criteria.makeup ?? 'sin_preferencia',
  }
  const recommendedOutfits = recommendOutfits(input, outfits)
  const recommendedMakeups = recommendMakeup(input, makeups, recommendedOutfits[0])

  return <>
    <Card>
    <p className="eyebrow">Tu consulta · Paso 3</p>
    <h1>Tus recomendaciones</h1>
    <div className="actions">
      <Link className="button button--secondary" to="/ocasion">Cambiar preferencias</Link>
      <Button onClick={() => { reset(); navigate('/ocasion') }}>Nueva consulta</Button>
      <Link to="/catalogo">Explorar el catálogo</Link>
    </div>
    </Card>
    <ResultsView outfits={recommendedOutfits} makeups={recommendedMakeups} />
  </>
}
