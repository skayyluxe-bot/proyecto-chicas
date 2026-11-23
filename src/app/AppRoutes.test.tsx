import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './AppRoutes'
import { ConsultationProvider } from '../state/ConsultationContext'
import { ResultsView } from '../components/ResultsView'
import * as tryOnClient from '../components/virtual-try-on/tryOnClient'
import { outfits } from '../data/outfits'
import { makeups } from '../data/makeups'

function renderApp(path: string) {
  window.location.hash = path
  return render(<HashRouter><ConsultationProvider><AppRoutes /></ConsultationProvider></HashRouter>)
}

const BrowserURL = URL
beforeAll(() => {
  vi.stubGlobal('URL', class extends BrowserURL {
    static createObjectURL = vi.fn(() => 'blob:test-reference')
    static revokeObjectURL = vi.fn()
  })
})

describe('Presentación independiente de resultados', () => {
  it('muestra las propuestas recibidas y las prendas del outfit', () => {
    render(<ResultsView outfits={[outfits[0]]} makeups={[makeups[0]]} />)
    expect(screen.getByRole('heading', { name: outfits[0].nombre })).toBeVisible()
    expect(screen.getByRole('heading', { name: makeups[0].nombre })).toBeVisible()
    for (const prenda of outfits[0].prendas) expect(screen.getByText(prenda)).toBeVisible()
    expect(screen.getAllByRole('img')).toHaveLength(2)
  }, 30000)

  it('presenta mensajes claros con arreglos vacíos', () => {
    render(<ResultsView outfits={[]} makeups={[]} />)
    expect(screen.getByText(/No hay outfits para mostrar/)).toBeVisible()
    expect(screen.getByText(/No hay maquillajes para mostrar/)).toBeVisible()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
afterAll(() => vi.unstubAllGlobals())
beforeEach(() => { window.history.replaceState(null, '', '/#/') })

describe('Rutas y consulta compartida', () => {
  it.each([
    ['/', 'Tu ocasión.Tu propio estilo.'],
    ['/ocasion', 'Ocasión y preferencias'],
    ['/foto', 'Fotografía opcional'],
    ['/catalogo', 'Catálogo'],
  ])('abre directamente %s', (path, title) => {
    renderApp(path)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title)
    expect(screen.getByRole('main')).toHaveFocus()
  }, 30000)

  it('redirige resultados a la selección cuando falta una ocasión', async () => {
    renderApp('/resultados')
    expect(await screen.findByRole('heading', { name: 'Ocasión y preferencias' })).toBeVisible()
    expect(window.location.hash).toBe('#/ocasion')
  })

  it('redirige una ruta desconocida al inicio', async () => {
    renderApp('/no-existe')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Tu ocasión.')
    expect(window.location.hash).toBe('#/')
  })

  it('conserva y combina preferencias y fotografía al navegar, y permite reiniciar', async () => {
    const user = userEvent.setup()
    renderApp('/ocasion')
    await user.selectOptions(screen.getByLabelText('Ocasión (obligatoria)'), 'fiesta')
    await user.selectOptions(screen.getByLabelText('Estilo de vestimenta (opcional)'), 'moderno')
    await user.selectOptions(screen.getByLabelText('Preferencia de maquillaje (opcional)'), 'natural')
    await user.click(screen.getByRole('button', { name: 'Continuar con fotografía' }))
    await user.upload(screen.getByLabelText('Seleccionar de la galería'), new File(['foto'], 'referencia.png', { type: 'image/png' }))
    await user.click(screen.getByRole('link', { name: 'Catálogo' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Catálogo')
    await user.click(screen.getByRole('link', { name: 'Consulta' }))
    expect(screen.getByLabelText('Ocasión (obligatoria)')).toHaveValue('fiesta')
    expect(screen.getByLabelText('Estilo de vestimenta (opcional)')).toHaveValue('moderno')
    expect(screen.getByLabelText('Preferencia de maquillaje (opcional)')).toHaveValue('natural')
    await user.click(screen.getByRole('button', { name: 'Continuar con fotografía' }))
    expect(screen.getByRole('img', { name: 'Fotografía de referencia seleccionada' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Ver resultados' }))
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
      'Fiesta urbana', 'Noche satinada', 'Fiesta sin complicaciones', 'Luz de noche', 'Mirada de fiesta',
    ])
    await user.click(screen.getByRole('button', { name: 'Nueva consulta' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ocasión y preferencias')
    expect(screen.getByLabelText('Ocasión (obligatoria)')).toHaveValue('')
    expect(screen.getByLabelText('Estilo de vestimenta (opcional)')).toHaveValue('sin_preferencia')
    expect(screen.getByLabelText('Preferencia de maquillaje (opcional)')).toHaveValue('sin_preferencia')
    await user.selectOptions(screen.getByLabelText('Ocasión (obligatoria)'), 'graduacion')
    await user.click(screen.getByRole('button', { name: 'Continuar con fotografía' }))
    expect(screen.getByLabelText('Seleccionar de la galería')).toBeVisible()
  }, 30000)

  it('comenzar desde inicio limpia la consulta anterior', async () => {
    const user = userEvent.setup()
    renderApp('/ocasion')
    await user.selectOptions(screen.getByLabelText('Ocasión (obligatoria)'), 'fiesta')
    await user.click(screen.getByRole('link', { name: 'Inicio' }))
    await user.click(screen.getByRole('button', { name: 'Comenzar una consulta' }))
    expect(window.location.hash).toBe('#/ocasion')
    expect(screen.getByLabelText('Ocasión (obligatoria)')).toHaveValue('')
  }, 30000)

  it('valida la galería, muestra la referencia y la libera al continuar a resultados', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderApp('/ocasion')
    await user.selectOptions(screen.getByLabelText('Ocasión (obligatoria)'), 'fiesta')
    await user.click(screen.getByRole('button', { name: 'Continuar con fotografía' }))

    const gallery = screen.getByLabelText('Seleccionar de la galería')
    await user.upload(gallery, new File(['texto'], 'referencia.txt', { type: 'text/plain' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Elige una imagen JPG, PNG o WebP')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    const maxBytes = 5 * 1024 * 1024
    await user.upload(gallery, new File([new Uint8Array(maxBytes + 1)], 'grande.png', { type: 'image/png' }))
    expect(screen.getByRole('alert')).toHaveTextContent('La imagen supera los 5 MB')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    await user.upload(gallery, new File([new Uint8Array(maxBytes)], 'referencia.png', { type: 'image/png' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fotografía de referencia seleccionada' })).toHaveAttribute('src', 'blob:test-reference')

    vi.mocked(URL.revokeObjectURL).mockClear()
    await user.click(screen.getByRole('button', { name: 'Ver resultados' }))
    expect(screen.getByRole('heading', { name: 'Tus recomendaciones' })).toBeVisible()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-reference')
  }, 30000)

  it('exige una ocasión y permite continuar sin foto con preferencias opcionales', async () => {
    const user = userEvent.setup()
    renderApp('/ocasion')
    await user.click(screen.getByRole('button', { name: 'Recomendar sin fotografía' }))
    expect(window.location.hash).toBe('#/ocasion')
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona una ocasión')
    await user.selectOptions(screen.getByLabelText('Ocasión (obligatoria)'), 'cumpleanos')
    await user.click(screen.getByRole('button', { name: 'Continuar con fotografía' }))
    await user.upload(screen.getByLabelText('Seleccionar de la galería'), new File(['foto'], 'referencia.png', { type: 'image/png' }))
    await user.click(screen.getByRole('link', { name: 'Volver a preferencias' }))
    await user.click(screen.getByRole('button', { name: 'Recomendar sin fotografía' }))
    expect(window.location.hash).toBe('#/resultados')
    expect(screen.getByRole('heading', { name: 'Cumpleaños entre amigas' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Rosa de cumpleaños' })).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Cambiar preferencias' }))
    expect(screen.getByLabelText('Ocasión (obligatoria)')).toHaveValue('cumpleanos')
    await user.click(screen.getByRole('button', { name: 'Continuar con fotografía' }))
    expect(screen.getByLabelText('Seleccionar de la galería')).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Volver a preferencias' }))
    await user.selectOptions(screen.getByLabelText('Estilo de vestimenta (opcional)'), 'moderno')
    await user.click(screen.getByRole('button', { name: 'Recomendar sin fotografía' }))
    const outfitResults = screen.getByRole('region', { name: 'Outfits para tu ocasión' })
    const makeupResults = screen.getByRole('region', { name: 'Maquillajes para acompañarte' })
    expect(within(outfitResults).getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Cumpleaños contemporáneo')
    expect(within(makeupResults).getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Brillo de celebración')
  }, 30000)
})

describe('Probador virtual', () => {
  async function openTryOn() {
    const user = userEvent.setup()
    renderApp('/ocasion')
    await user.selectOptions(screen.getByLabelText('Ocasión (obligatoria)'), 'fiesta')
    await user.click(screen.getByRole('button', { name: 'Recomendar sin fotografía' }))
    await user.click(screen.getByRole('link', { name: 'Añadir una foto' }))
    const photo = new File(['foto'], 'referencia.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText('Seleccionar de la galería'), photo)
    await user.click(screen.getByRole('button', { name: 'Ver resultados' }))
    return { user, photo, panel: within(screen.getByRole('region', { name: 'Probador virtual' })) }
  }

  async function selectLook(user: ReturnType<typeof userEvent.setup>, panel: ReturnType<typeof within>) {
    await user.selectOptions(panel.getByLabelText('Outfit recomendado'), panel.getByRole('option', { name: 'Fiesta urbana' }))
    await user.selectOptions(panel.getByLabelText('Maquillaje recomendado'), panel.getByRole('option', { name: 'Luz de noche' }))
  }

  it('exige elegir el look y autorizar antes de mostrar la comparación simulada', async () => {
    const { user, photo, panel } = await openTryOn()
    const request = vi.spyOn(tryOnClient, 'requestTryOn')
    try {
      const submit = panel.getByRole('button', { name: 'Probar en mi foto' })
      expect(submit).toBeDisabled()
      await selectLook(user, panel)
      await user.click(submit)
      expect(request).not.toHaveBeenCalled()
      await user.click(panel.getByRole('checkbox'))
      await user.click(submit)
      expect(submit).toBeDisabled()
      expect(panel.getByRole('status')).toHaveTextContent('Preparando la comparación')
      expect(request).toHaveBeenCalledOnce()
      expect(request.mock.calls[0][0]).toMatchObject({
        photo,
        outfit: { nombre: 'Fiesta urbana' },
        makeup: { nombre: 'Luz de noche' },
      })
      expect(await panel.findByRole('img', { name: 'Tu fotografía original' })).toHaveAttribute('src', 'blob:test-reference')
      expect(panel.getByText('Después · Ilustración de ejemplo')).toBeVisible()

      vi.mocked(URL.revokeObjectURL).mockClear()
      await user.click(panel.getByRole('checkbox'))
      expect(panel.queryByRole('img')).not.toBeInTheDocument()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-reference')
    } finally {
      request.mockRestore()
    }
  }, 30000)

  it('mantiene las recomendaciones y permite reintentar si falla la edición', async () => {
    const { user, panel } = await openTryOn()
    const request = vi.spyOn(tryOnClient, 'requestTryOn').mockRejectedValueOnce(new Error('Error simulado'))
    try {
      await selectLook(user, panel)
      await user.click(panel.getByRole('checkbox'))
      const submit = panel.getByRole('button', { name: 'Probar en mi foto' })
      await user.click(submit)
      expect(await panel.findByRole('alert')).toHaveTextContent('No pudimos preparar la comparación')
      expect(screen.getByRole('heading', { name: 'Fiesta urbana' })).toBeVisible()
      expect(submit).toBeEnabled()
      await user.click(submit)
      expect(await panel.findByText('Después · Ilustración de ejemplo')).toBeVisible()
      expect(panel.queryByRole('alert')).not.toBeInTheDocument()
    } finally {
      request.mockRestore()
    }
  }, 30000)
})
