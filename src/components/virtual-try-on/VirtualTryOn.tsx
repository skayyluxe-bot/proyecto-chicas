import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Makeup, Outfit } from '../../domain/types'
import { Button } from '../Button'
import { Card } from '../Card'
import { requestTryOn, tryOnAvailable } from './tryOnClient'
import type { TryOnResult } from './tryOnClient'
import './virtualTryOn.css'

interface VirtualTryOnProps {
  photo: File | null
  outfits: Outfit[]
  makeups: Makeup[]
}

function PhotoComparison({ photo, result }: { photo: File; result: TryOnResult }) {
  const original = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = original.current
    if (!image) return
    const url = URL.createObjectURL(photo)
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [photo])

  return <div className="steps try-on-comparison">
    <figure>
      <img ref={original} alt="Tu fotografía original" />
      <figcaption>Antes · Tu foto</figcaption>
    </figure>
    <figure>
      <img src={result.imageUrl} alt={result.simulated ? 'Ilustración del outfit elegido' : 'Tu fotografía con el look elegido'} />
      <figcaption>{result.simulated ? 'Después · Ilustración de ejemplo' : 'Después · Aproximación del look'}</figcaption>
    </figure>
  </div>
}

export function VirtualTryOn({ photo, outfits, makeups }: VirtualTryOnProps) {
  const id = useId()
  const [outfitId, setOutfitId] = useState('')
  const [makeupId, setMakeupId] = useState('')
  const [consent, setConsent] = useState(false)
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => () => activeRequest.current?.abort(), [])

  const outfit = outfits.find(item => item.id === outfitId)
  const makeup = makeups.find(item => item.id === makeupId)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tryOnAvailable || !photo || !outfit || !makeup || !consent || activeRequest.current) return

    const controller = new AbortController()
    activeRequest.current = controller
    setPending(true)
    setError(false)
    setResult(null)

    try {
      const response = await requestTryOn({ photo, outfit, makeup }, controller.signal)
      if (!controller.signal.aborted) setResult(response)
    } catch {
      if (!controller.signal.aborted) setError(true)
    } finally {
      activeRequest.current = null
      if (!controller.signal.aborted) setPending(false)
    }
  }

  return <section className="try-on" aria-labelledby={`${id}-title`}>
    <Card>
      <h2 id={`${id}-title`}>Probador virtual</h2>
      {!tryOnAvailable ? <>
        <p>El probador virtual aún no está disponible.</p>
        <Button disabled>Probar en mi foto</Button>
      </> : !outfits.length || !makeups.length ? (
        <p>Necesitas un outfit y un maquillaje recomendados para probar un look.</p>
      ) : !photo ? <>
        <p>Para probar un look completo, añade una foto de cuerpo entero, con el rostro visible y buena iluminación.</p>
        <Link className="button button--secondary" to="/foto">Añadir una foto</Link>
      </> : <>
        <p>Elige el outfit y el maquillaje que quieres probar.</p>
        <p className="muted">Modo de prueba. La comparación usa una ilustración del catálogo y tu foto permanece en el navegador.</p>
        <form onSubmit={submit}>
          <fieldset disabled={pending}>
            <legend>Tu look</legend>
            <label htmlFor={`${id}-outfit`}>Outfit recomendado</label>
            <select id={`${id}-outfit`} value={outfitId} required onChange={event => {
              setOutfitId(event.target.value)
              setResult(null)
            }}>
              <option value="">Elige un outfit</option>
              {outfits.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
            <label htmlFor={`${id}-makeup`}>Maquillaje recomendado</label>
            <select id={`${id}-makeup`} value={makeupId} required onChange={event => {
              setMakeupId(event.target.value)
              setResult(null)
            }}>
              <option value="">Elige un maquillaje</option>
              {makeups.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
          </fieldset>
          <p id={`${id}-privacy`}>Al activar el servicio de edición real, se enviará la foto a OpenAI para aplicar el look.</p>
          <label className="try-on-consent">
            <input type="checkbox" checked={consent} required disabled={pending} aria-describedby={`${id}-privacy`}
              onChange={event => {
                setConsent(event.target.checked)
                setResult(null)
              }} />
            Simular mi autorización para editar esta foto
          </label>
          <div className="actions">
            <Button type="submit" disabled={!outfit || !makeup || !consent || pending}>Probar en mi foto</Button>
          </div>
        </form>
        <p role="status">{pending ? 'Preparando la comparación de prueba…' : result ? 'Comparación de prueba lista.' : ''}</p>
        {error && <p className="field-error" role="alert">No pudimos preparar la comparación. Puedes reintentar o consultar las recomendaciones.</p>}
        {result && <PhotoComparison photo={photo} result={result} />}
      </>}
    </Card>
  </section>
}
