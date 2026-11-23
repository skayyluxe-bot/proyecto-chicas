import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { makeupOptions, occasionOptions, styleOptions } from '../domain/options'
import type { MakeupPreference, Occasion, StylePreference } from '../domain/types'
import { useConsultation } from '../state/ConsultationContext'

export function OccasionPage() {
  const { criteria, updateCriteria, setPhoto } = useConsultation()
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  function continueConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!criteria.occasion) {
      setError(true)
      return
    }
    updateCriteria({ style: criteria.style ?? 'sin_preferencia', makeup: criteria.makeup ?? 'sin_preferencia' })
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const skipPhoto = submitter?.getAttribute('data-destination') === 'results'
    if (skipPhoto) setPhoto(null)
    navigate(skipPhoto ? '/resultados' : '/foto')
  }

  return <Card>
    <p className="eyebrow">Tu consulta · Paso 1</p>
    <h1>Ocasión y preferencias</h1>
    <p>Cuéntanos qué tienes planeado. Solo la ocasión es obligatoria; las demás preferencias son opcionales.</p>
    <form onSubmit={continueConsultation}>
      <fieldset>
        <legend>¿Cuál es la ocasión?</legend>
        <label htmlFor="occasion">Ocasión (obligatoria)</label>
        <select id="occasion" required value={criteria.occasion ?? ''}
          aria-invalid={error || undefined} aria-describedby={error ? 'occasion-error' : undefined}
          onInvalid={() => setError(true)}
          onChange={event => {
            updateCriteria({ occasion: event.target.value as Occasion })
            setError(false)
          }}>
          <option value="" disabled>Selecciona una ocasión</option>
          {occasionOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {error && <p id="occasion-error" className="field-error" role="alert">Selecciona una ocasión para continuar.</p>}
      </fieldset>
      <fieldset>
        <legend>Tu estilo</legend>
        <label htmlFor="style">Estilo de vestimenta (opcional)</label>
        <select id="style" value={criteria.style ?? 'sin_preferencia'} onChange={event => updateCriteria({ style: event.target.value as StylePreference })}>
          {styleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <p className="muted">Elige lo que más se acerque a ti o déjanos mostrarte distintas opciones.</p>
        <label htmlFor="makeup">Preferencia de maquillaje (opcional)</label>
        <select id="makeup" value={criteria.makeup ?? 'sin_preferencia'} onChange={event => updateCriteria({ makeup: event.target.value as MakeupPreference })}>
          {makeupOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </fieldset>
      <div className="actions">
        <Button type="submit">Continuar con fotografía</Button>
        <Button type="submit" variant="secondary" data-destination="results">Recomendar sin fotografía</Button>
      </div>
    </form>
    <p><Link to="/">Volver al inicio</Link></p>
  </Card>
}
