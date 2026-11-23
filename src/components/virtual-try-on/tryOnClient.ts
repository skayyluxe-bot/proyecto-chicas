import type { Makeup, Outfit } from '../../domain/types'

export interface TryOnRequest {
  photo: File
  outfit: Outfit
  makeup: Makeup
}

export interface TryOnResult {
  imageUrl: string
  simulated: boolean
}

export const tryOnAvailable = import.meta.env.DEV

export async function requestTryOn(request: TryOnRequest, signal: AbortSignal): Promise<TryOnResult> {
  if (!tryOnAvailable) throw new Error('El probador virtual aún no está disponible.')

  await new Promise<void>(resolve => window.setTimeout(resolve, 350))
  signal.throwIfAborted()

  return { imageUrl: request.outfit.imagen, simulated: true }
}
