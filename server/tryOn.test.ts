// @vitest-environment node
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tryOnHeaders } from '../src/domain/tryOn'
import { createImageEditor } from './imageEditor'
import { configuredTryOn, createTryOnHandler } from './tryOn'

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/FWsAAAAASUVORK5CYII=', 'base64')
const headers = {
  'Content-Type': 'image/png',
  [tryOnHeaders.consent]: 'true',
  [tryOnHeaders.outfit]: 'of-fiesta-02',
  [tryOnHeaders.makeup]: 'mk-fiesta-natural',
  [tryOnHeaders.mode]: 'simulated',
}
let server: Server

async function serve(handler: ReturnType<typeof createTryOnHandler>) {
  server = createServer(handler)
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No se pudo abrir un puerto de prueba.')
  const url = `http://127.0.0.1:${address.port}/api/try-on`
  return {
    mode: async () => (await fetch(url)).json(),
    submit: (patch?: Record<string, string>, body = png) => fetch(url, {
      method: 'POST',
      headers: { ...headers, ...patch },
      body: new Uint8Array(body),
    }),
  }
}

afterEach(async () => {
  if (server?.listening) await new Promise<void>(resolve => server.close(() => resolve()))
})

describe('Servicio del probador virtual', () => {
  it('mantiene deshabilitada la edición sin clave o sin activación explícita', async () => {
    const service = await serve(configuredTryOn({ TRY_ON_MODE: 'openai' }))
    expect(await service.mode()).toEqual({ mode: 'disabled' })
    expect((await service.submit({ [tryOnHeaders.mode]: 'openai' })).status).toBe(503)
  })

  it('rechaza un cambio de modo, la falta de autorización y los looks inválidos', async () => {
    const service = await serve(configuredTryOn({ TRY_ON_MODE: 'simulated' }))
    expect(await service.mode()).toEqual({ mode: 'simulated' })
    expect((await service.submit({ [tryOnHeaders.mode]: 'openai' })).status).toBe(503)
    expect((await service.submit({ [tryOnHeaders.consent]: 'false' })).status).toBe(400)
    expect((await service.submit({ [tryOnHeaders.outfit]: 'desconocido' })).status).toBe(400)
    expect((await service.submit({ [tryOnHeaders.makeup]: 'mk-cena-glam' })).status).toBe(400)
  })

  it('valida el tipo, la firma y el tamaño real de la foto', async () => {
    const service = await serve(configuredTryOn({ TRY_ON_MODE: 'simulated' }))
    expect((await service.submit({ 'Content-Type': 'text/plain' })).status).toBe(415)
    expect((await service.submit({}, Buffer.from('Foto inválida'))).status).toBe(415)
    expect((await service.submit({}, Buffer.alloc(5 * 1024 * 1024 + 1))).status).toBe(413)
  })

  it('devuelve una ilustración simulada y limita las ediciones por hora', async () => {
    let time = 10
    const service = await serve(createTryOnHandler({ mode: 'simulated', now: () => time }))
    for (let count = 0; count < 10; count += 1) {
      const response = await service.submit()
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toMatchObject({ imageUrl: expect.stringContaining('outfit-casual.svg'), simulated: true })
    }
    const limited = await service.submit()
    expect(limited.status).toBe(429)
    expect(limited.headers.get('retry-after')).toBe('3600')
    time += 3_600_000
    expect((await service.submit()).status).toBe(200)
  })

  it('envía el look del catálogo al adaptador y registra solo datos de uso', async () => {
    const send = vi.fn<typeof fetch>().mockResolvedValue(Response.json({
      data: [{ b64_json: 'QUJD' }],
      usage: { input_tokens: 200, output_tokens: 300, input_tokens_details: { image_tokens: 150, text_tokens: 50 } },
    }))
    const log = vi.fn()
    const service = await serve(createTryOnHandler({ mode: 'openai', edit: createImageEditor('clave-simulada', send), log }))
    const response = await service.submit({ [tryOnHeaders.mode]: 'openai' })
    expect(await response.json()).toEqual({ imageUrl: 'data:image/jpeg;base64,QUJD', simulated: false })
    const [url, init] = send.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/images/edits')
    expect(init?.headers).toEqual({ Authorization: 'Bearer clave-simulada' })
    const form = init?.body as FormData
    expect(form.get('model')).toBe('gpt-image-2.6-flare')
    expect(form.get('size')).toBe('1024x1536')
    expect(form.get('quality')).toBe('medium')
    expect(form.get('n')).toBe('1')
    expect(form.get('output_format')).toBe('jpeg')
    expect(form.get('image[]')).toMatchObject({ name: 'referencia.png', type: 'image/png', size: png.length })
    expect(form.get('prompt')).toContain('Top metalizado')
    expect(form.get('prompt')).toContain('labios nude')
    expect(log).toHaveBeenCalledWith({
      event: 'try_on', status: 200, durationMs: expect.any(Number),
      inputTokens: 200, outputTokens: 300, imageInputTokens: 150, textInputTokens: 50,
    })
  })

  it('bloquea envíos simultáneos y devuelve 504 cuando se agota el tiempo', async () => {
    let providerStarted!: () => void
    const providerCalled = new Promise<void>(resolve => { providerStarted = resolve })
    const send = vi.fn<typeof fetch>().mockImplementation(async (_url, init) => {
      providerStarted()
      return new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
      })
    })
    const service = await serve(createTryOnHandler({ mode: 'openai', edit: createImageEditor('falsa', send), timeoutMs: 500, log: vi.fn() }))
    const realMode = { [tryOnHeaders.mode]: 'openai' }
    const pending = service.submit(realMode)
    await providerCalled
    expect((await service.submit(realMode)).status).toBe(429)
    expect((await pending).status).toBe(504)
    expect(send).toHaveBeenCalledOnce()
  })

  it('oculta el contenido de los errores del proveedor', async () => {
    const send = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: 'datos privados' }, { status: 400 }))
    const service = await serve(createTryOnHandler({ mode: 'openai', edit: createImageEditor('falsa', send), log: vi.fn() }))
    const response = await service.submit({ [tryOnHeaders.mode]: 'openai' })
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'No se pudo completar la edición.' })
  })
})
