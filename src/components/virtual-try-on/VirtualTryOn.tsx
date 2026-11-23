import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Makeup, Outfit } from '../../domain/types'
import { Button } from '../Button'
import { Card } from '../Card'
import type { TryOnMode, TryOnResult } from '../../domain/tryOn'
import { getTryOnMode, requestTryOn } from './tryOnClient'
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
  const [mode, setMode] = useState<TryOnMode | null>(null)
  const [outfitId, setOutfitId] = useState('')
  const [makeupId, setMakeupId] = useState('')
  const [consent, setConsent] = useState(false)
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getTryOnMode(controller.signal).then(available => {
      if (!controller.signal.aborted) setMode(available)
    })
    return () => {
      controller.abort()
      activeRequest.current?.abort()
    }
  }, [])

  const outfit = outfits.find(item => item.id === outfitId)
  const makeup = makeups.find(item => item.id === makeupId)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mode || mode === 'disabled' || !photo || !outfit || !makeup || !consent || activeRequest.current) return

    const controller = new AbortController()
    activeRequest.current = controller
    setPending(true)
    setError('')
    setResult(null)

    try {
      const response = await requestTryOn({ photo, outfit, makeup, mode }, controller.signal)
      if (!controller.signal.aborted) setResult(response)
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(failure instanceof Error ? failure.message : 'No pudimos editar la foto.')
      }
    } finally {
      activeRequest.current = null
      if (!controller.signal.aborted) setPending(false)
    }
  }

  return <section className="try-on" aria-labelledby={`${id}-title`}>
    <Card>
      <h2 id={`${id}-title`}>Probador virtual</h2>
      {mode === null ? <p role="status">Comprobando disponibilidad…</p> : mode === 'disabled' ? <>
        <p>El probador virtual aún no está disponible.</p>
        <Button disabled>Probar en mi foto</Button>
      </> : !outfits.length || !makeups.length ? (
        <p>Necesitas un outfit y un maquillaje recomendados para probar un look.</p>
      ) : !photo ? <>
        <p>Para probar un look completo, añade una foto de cuerpo entero, con el rostro visible y buena iluminación.</p>
        <Link className="button button--secondary" to="/foto">Añadir una foto</Link>
      </> : <>
        <p>Elige el outfit y el maquillaje que quieres probar.</p>
        {mode === 'simulated' && <p className="muted">Modo de prueba. El servidor devuelve una ilustración del catálogo. OpenAI no recibe tu foto.</p>}
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
          <p id={`${id}-privacy`}>{mode === 'simulated' ? 'La foto se enviará al servidor de prueba para validar el archivo.'
            : 'Enviaremos tu foto a OpenAI para aplicar el look. OpenAI puede conservarla hasta 30 días para supervisar el uso y, en ciertos casos, más tiempo para revisión de seguridad.'}</p>
          {mode === 'openai' && <p><a href="https://developers.openai.com/api/docs/guides/your-data">Cómo trata OpenAI los datos de la API</a></p>}
          <label className="try-on-consent">
            <input type="checkbox" checked={consent} required disabled={pending} aria-describedby={`${id}-privacy`}
              onChange={event => {
                setConsent(event.target.checked)
                setResult(null)
              }} />
            {mode === 'simulated' ? 'Autorizo el envío de mi foto al servidor de prueba' : 'Autorizo el envío de mi foto a OpenAI para editarla'}
          </label>
          <div className="actions">
            <Button type="submit" disabled={!outfit || !makeup || !consent || pending}>Probar en mi foto</Button>
          </div>
        </form>
        <p role="status">{pending ? 'Preparando la comparación…' : result ? 'Comparación lista.' : ''}</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        {result && <PhotoComparison photo={photo} result={result} />}
      </>}
    </Card>
  </section>
}
