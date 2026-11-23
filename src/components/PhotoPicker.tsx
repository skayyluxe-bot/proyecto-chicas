import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Button } from './Button'

interface PhotoPickerProps {
  photo: File | null
  onChange: (file: File | null) => void
}

const maxPhotoBytes = 5 * 1024 * 1024
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function PhotoPicker({ photo, onChange }: PhotoPickerProps) {
  const id = useId()
  const [error, setError] = useState('')
  const [cameraSupported] = useState(() => 'capture' in document.createElement('input'))
  const preview = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!photo || !preview.current) return
    const url = URL.createObjectURL(photo)
    preview.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [photo])

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!imageTypes.has(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setError('Elige una imagen JPG, PNG o WebP.')
      return
    }
    if (file.size === 0) {
      setError('La imagen está vacía. Selecciona otra fotografía.')
      return
    }
    if (file.size > maxPhotoBytes) {
      setError('La imagen supera los 5 MB. Selecciona una fotografía más pequeña.')
      return
    }
    setError('')
    onChange(file)
  }

  return <section aria-label="Fotografía de referencia">
    <p id={`${id}-privacy`}>La fotografía es solo una referencia visual; esta versión no analiza imágenes.</p>
    <p id={`${id}-formats`} className="muted">JPG, PNG o WebP · Máximo 5 MB. Como referencia, la foto queda en tu navegador. El probador virtual te pedirá autorización antes de enviarla.</p>
    <label htmlFor={`${id}-gallery`}>{photo ? 'Cambiar fotografía de la galería' : 'Seleccionar de la galería'}</label>
    <input id={`${id}-gallery`} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile}
      aria-describedby={`${id}-formats ${id}-privacy${error ? ` ${id}-error` : ''}`} aria-invalid={!!error || undefined} />
    {cameraSupported && <>
      <p className="muted">En dispositivos compatibles puedes tomar una fotografía con la cámara.</p>
      <label htmlFor={`${id}-camera`}>Tomar una fotografía</label>
      <input id={`${id}-camera`} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={selectFile}
        aria-describedby={`${id}-formats ${id}-privacy${error ? ` ${id}-error` : ''}`} aria-invalid={!!error || undefined} />
    </>}
    {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
    {photo && <figure style={{ margin: '1.5rem 0' }}>
      <img ref={preview} alt="Fotografía de referencia seleccionada" style={{ maxHeight: 360, width: '100%', objectFit: 'contain', borderRadius: 'var(--radius)' }} />
      <figcaption className="muted">Tu referencia visual · {Math.ceil(photo.size / 1024)} KB</figcaption>
      <div className="actions"><Button variant="secondary" onClick={() => { setError(''); onChange(null) }}>Eliminar fotografía</Button></div>
    </figure>}
  </section>
}
