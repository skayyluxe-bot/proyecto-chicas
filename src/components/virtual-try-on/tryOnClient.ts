import type { Makeup, Outfit } from '../../domain/types'
import { tryOnHeaders, tryOnPath } from '../../domain/tryOn'
import type { TryOnMode, TryOnResult } from '../../domain/tryOn'

const endpoint = `${import.meta.env.BASE_URL}${tryOnPath}`

export interface TryOnRequest {
  photo: File
  outfit: Outfit
  makeup: Makeup
  mode: Exclude<TryOnMode, 'disabled'>
}

export async function getTryOnMode(signal: AbortSignal): Promise<TryOnMode> {
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) })
    if (!response.ok) return 'disabled'
    const { mode } = await response.json() as { mode?: unknown }
    return mode === 'openai' || mode === 'simulated' ? mode : 'disabled'
  } catch {
    return 'disabled'
  }
}

export async function requestTryOn(request: TryOnRequest, signal: AbortSignal): Promise<TryOnResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    signal,
    redirect: 'error',
    headers: {
      'Content-Type': request.photo.type,
      [tryOnHeaders.mode]: request.mode,
      [tryOnHeaders.consent]: 'true',
      [tryOnHeaders.outfit]: request.outfit.id,
      [tryOnHeaders.makeup]: request.makeup.id,
    },
    body: request.photo,
  })
  if (response.status === 429) throw new Error('El probador alcanzó su límite de uso o ya está procesando una foto. Inténtalo más tarde.')
  if (response.status === 504) throw new Error('La edición tardó demasiado. Puedes reintentar o consultar las recomendaciones.')
  if (!response.ok) throw new Error('No pudimos editar la foto. Puedes reintentar o consultar las recomendaciones.')
  const result = await response.json() as TryOnResult
  if (!result.imageUrl || result.simulated !== (request.mode === 'simulated')) throw new Error('La edición no devolvió una imagen.')
  return result
}
