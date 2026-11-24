import type { IncomingMessage, ServerResponse } from 'node:http'
import { makeups } from '../src/data/makeups'
import { outfits } from '../src/data/outfits'
import { tryOnHeaders } from '../src/domain/tryOn'
import type { TryOnMode, TryOnResult } from '../src/domain/tryOn'
import type { Makeup, Outfit } from '../src/domain/types'
import { createImageEditor, ImageProviderError, photoExtensions } from './imageEditor'
import type { PhotoType } from './imageEditor'

const maxPhotoBytes = 5 * 1024 * 1024
const windowMs = 60 * 60 * 1000
const maxEditsPerHour = 10

class TryOnError extends Error {
  constructor(readonly status: number) {
    super(`Edición rechazada (${status}).`)
  }
}

function json(response: ServerResponse, status: number, body: object) {
  if (response.destroyed || response.writableEnded) return
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  response.end(JSON.stringify(body))
}

function hasImageSignature(bytes: Buffer, type: PhotoType) {
  if (type === 'image/jpeg') return bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
  if (type === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
}

async function readPhoto(request: IncomingMessage) {
  const type = request.headers['content-type']
  if (!type || !Object.hasOwn(photoExtensions, type)) throw new TryOnError(415)
  if (Number(request.headers['content-length']) > maxPhotoBytes) throw new TryOnError(413)
  const chunks: Uint8Array<ArrayBuffer>[] = []
  let total = 0
  for await (const chunk of request.iterator({ destroyOnReturn: false }) as AsyncIterable<Buffer>) {
    total += chunk.length
    if (total > maxPhotoBytes) throw new TryOnError(413)
    chunks.push(Uint8Array.from(chunk))
  }
  const photoType = type as PhotoType
  if (!hasImageSignature(Buffer.concat(chunks), photoType)) throw new TryOnError(415)
  return { photo: new Blob(chunks, { type }), photoType }
}

function buildPrompt(outfit: Outfit, makeup: Makeup) {
  return [
    'Edita esta foto para visualizar el look que eligió la persona. Cambia solo la ropa, los accesorios y el maquillaje.',
    `Outfit: ${outfit.nombre}. ${outfit.descripcion} Prendas y accesorios: ${outfit.prendas.join(', ')}.`,
    `Maquillaje: ${makeup.nombre}. ${makeup.descripcion}`,
    'Conserva los rasgos faciales, el tono de piel, las proporciones, la pose y el fondo. Mantén el encuadre original en lo posible.',
    'Entrega una sola foto realista sin texto ni decoración adicional.',
  ].join('\n')
}

interface TryOnOptions {
  mode: TryOnMode
  edit?: ReturnType<typeof createImageEditor>
  now?: () => number
  timeoutMs?: number
  log?: (details: Record<string, unknown>) => void
}

export function createTryOnHandler({
  mode, edit, now = Date.now, timeoutMs = 120_000, log = console.info,
}: TryOnOptions) {
  const availableMode = mode === 'openai' && !edit ? 'disabled' : mode
  let active = false
  const editTimes: number[] = []

  return async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method === 'GET') return json(response, 200, { mode: availableMode })
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST')
      return json(response, 405, { error: 'Método no admitido.' })
    }

    let acquired = false
    let started: number | undefined
    const disconnected = new AbortController()
    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = AbortSignal.any([disconnected.signal, timeout])
    const onClose = () => disconnected.abort()

    try {
      if (availableMode === 'disabled' || request.headers[tryOnHeaders.mode] !== availableMode) throw new TryOnError(503)
      if (request.headers[tryOnHeaders.consent] !== 'true') throw new TryOnError(400)
      const outfit = outfits.find(item => item.id === request.headers[tryOnHeaders.outfit])
      const makeup = makeups.find(item => item.id === request.headers[tryOnHeaders.makeup])
      if (!outfit || !makeup || !outfit.ocasiones.some(occasion => makeup.ocasiones.includes(occasion))) throw new TryOnError(400)
      if (active) throw new TryOnError(429)
      active = acquired = true

      const timestamp = now()
      while (editTimes.length && timestamp - editTimes[0] >= windowMs) editTimes.shift()
      if (editTimes.length >= maxEditsPerHour) {
        response.setHeader('Retry-After', Math.ceil((windowMs - timestamp + editTimes[0]) / 1000))
        throw new TryOnError(429)
      }

      response.on('close', onClose)
      const input = await readPhoto(request)
      signal.throwIfAborted()
      started = now()
      editTimes.push(started)

      if (availableMode === 'simulated') {
        const result: TryOnResult = { imageUrl: outfit.imagen, simulated: true }
        return json(response, 200, result)
      }
      const result = await edit!({ ...input, prompt: buildPrompt(outfit, makeup) }, signal)
      signal.throwIfAborted()
      log({ event: 'try_on', status: 200, durationMs: now() - started, ...result.usage })
      const payload: TryOnResult = { imageUrl: result.imageUrl, simulated: false }
      return json(response, 200, payload)
    } catch (error) {
      const status = timeout.aborted ? 504 : disconnected.signal.aborted ? 499 : error instanceof TryOnError ? error.status : 502
      if (started !== undefined && availableMode === 'openai') {
        const providerDetails = error instanceof ImageProviderError
          ? { providerStatus: error.providerStatus, providerCode: error.providerCode }
          : {}
        log({ event: 'try_on', status, durationMs: now() - started, ...providerDetails })
      }
      if (response.destroyed) return
      request.resume()
      return json(response, status, { error: 'No se pudo completar la edición.' })
    } finally {
      response.off('close', onClose)
      if (acquired) active = false
    }
  }
}

export function configuredTryOn(env: NodeJS.ProcessEnv) {
  if (env.TRY_ON_MODE === 'simulated') return createTryOnHandler({ mode: 'simulated' })
  const key = env.OPENAI_API_KEY?.trim()
  if (env.TRY_ON_MODE === 'openai' && key) return createTryOnHandler({ mode: 'openai', edit: createImageEditor(key) })
  return createTryOnHandler({ mode: 'disabled' })
}
