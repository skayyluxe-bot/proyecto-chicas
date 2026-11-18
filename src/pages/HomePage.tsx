import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useConsultation } from '../state/ConsultationContext'

export function HomePage() {
  const { reset } = useConsultation()
  const navigate = useNavigate()
  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Moda &amp; belleza, a tu manera</p>
        <h1 id="home-title">Tu ocasión.<br />Tu propio estilo.</h1>
        <p>Un espacio para encontrar inspiración y combinar outfits con maquillaje según tus preferencias.</p>
        <p className="muted">Estamos preparando tu experiencia. Pronto podrás consultar recomendaciones sin registrarte.</p>
        <div className="actions">
          <Button onClick={() => { reset(); navigate('/ocasion') }}>Comenzar una consulta</Button>
          <Link className="button button--secondary" to="/catalogo">Explorar el catálogo</Link>
        </div>
      </section>
      <section className="steps" aria-label="Cómo será tu consulta">
        <Card><p className="eyebrow">01 · La ocasión</p><h2>Elige tu plan</h2><p>Cumpleaños, fiestas, cenas formales, salidas casuales y graduaciones.</p></Card>
        <Card><p className="eyebrow">02 · Tus preferencias</p><h2>Dale tu toque</h2><p>Tu estilo de ropa, tu maquillaje y una fotografía opcional como referencia visual.</p></Card>
        <Card><p className="eyebrow">03 · Inspiración</p><h2>Descubre combinaciones</h2><p>Outfits y maquillajes pensados para la ocasión que elijas.</p></Card>
      </section>
    </>
  )
}
