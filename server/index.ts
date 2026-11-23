import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tryOnPath } from '../src/domain/tryOn'
import { configuredTryOn } from './tryOn'

const mediaTypes: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  svg: 'image/svg+xml',
}
const tryOn = configuredTryOn(process.env)
const dist = resolve('dist')

const server = createServer({ requestTimeout: 30_000, headersTimeout: 15_000 }, async (request, response) => {
  const path = request.url?.split('?')[0] ?? '/'
  if (path === `/${tryOnPath}`) return tryOn(request, response)

  const file = path === '/' || path === '/index.html' ? 'index.html' : path.slice(1)
  if ((request.method !== 'GET' && request.method !== 'HEAD')
    || !/^(?:index\.html|assets\/[\w-]+\.(?:js|css)|images\/[\w-]+\.svg)$/.test(file)) {
    response.writeHead(404).end()
    return
  }

  try {
    const content = await readFile(resolve(dist, file))
    response.writeHead(200, {
      'Content-Type': mediaTypes[file.split('.').at(-1)!],
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': file.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    }).end(request.method === 'HEAD' ? undefined : content)
  } catch {
    response.writeHead(404).end()
  }
})

server.listen(Number(process.env.PORT ?? 4174), process.env.HOST ?? '127.0.0.1', () => {
  console.info('Beauty & Fashion está listo para recibir consultas.')
})
