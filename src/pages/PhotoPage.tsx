import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { PhotoPicker } from '../components/PhotoPicker'
import { useConsultation } from '../state/ConsultationContext'

export function PhotoPage() {
  const { photo, setPhoto } = useConsultation()
  const navigate = useNavigate()
  return <Card>
    <p className="eyebrow">Tu consulta · Paso 2</p>
    <h1>Fotografía opcional</h1>
    <p>Puedes añadir una referencia para consultar junto a tus preferencias o continuar sin ella.</p>
    <PhotoPicker photo={photo} onChange={setPhoto} />
    <div className="actions">
      {photo && <Button onClick={() => navigate('/resultados')}>Ver resultados</Button>}
      <Button variant={photo ? 'secondary' : 'primary'} onClick={() => { setPhoto(null); navigate('/resultados') }}>Continuar sin fotografía</Button>
    </div>
    <p><Link to="/ocasion">Volver a preferencias</Link></p>
  </Card>
}
