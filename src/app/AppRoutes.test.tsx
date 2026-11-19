import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './AppRoutes'
import { ConsultationProvider, useConsultation } from '../state/ConsultationContext'
import { ResultsView } from '../components/ResultsView'
import { outfits } from '../data/outfits'
import { makeups } from '../data/makeups'

function StateProbe() {
  const { criteria, photo, updateCriteria, setPhoto } = useConsultation()
  return <aside aria-label="Controles de prueba">
    <button onClick={() => updateCriteria({ occasion: 'fiesta' })}>Elegir ocasión</button>
    <button onClick={() => updateCriteria({ style: 'moderno', makeup: 'natural' })}>Elegir preferencias</button>
    <button onClick={() => setPhoto(new File(['foto'], 'referencia.png', { type: 'image/png' }))}>Adjuntar referencia</button>
    <output data-testid="state">{JSON.stringify({ criteria, photo: photo?.name ?? null })}</output>
  </aside>
}

function renderApp(path: string) {
  window.location.hash = path
  return render(<HashRouter><ConsultationProvider><StateProbe /><AppRoutes /></ConsultationProvider></HashRouter>)
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
    await user.click(screen.getByRole('button', { name: 'Elegir ocasión' }))
    await user.click(screen.getByRole('button', { name: 'Elegir preferencias' }))
    await user.click(screen.getByRole('button', { name: 'Adjuntar referencia' }))
    const expected = { criteria: { occasion: 'fiesta', style: 'moderno', makeup: 'natural' }, photo: 'referencia.png' }
    await user.click(screen.getByRole('link', { name: 'Catálogo' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Catálogo')
    expect(JSON.parse(screen.getByTestId('state').textContent!)).toEqual(expected)
    await user.click(screen.getByRole('link', { name: 'Consulta' }))
    await user.click(screen.getByRole('button', { name: 'Continuar con fotografía' }))
    await user.click(screen.getByRole('button', { name: 'Ver resultados' }))
    expect(JSON.parse(screen.getByTestId('state').textContent!)).toEqual(expected)
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
      'Fiesta urbana', 'Noche satinada', 'Fiesta sin complicaciones', 'Luz de noche', 'Mirada de fiesta',
    ])
    await user.click(screen.getByRole('button', { name: 'Nueva consulta' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ocasión y preferencias')
    expect(JSON.parse(screen.getByTestId('state').textContent!)).toEqual({ criteria: {}, photo: null })
  }, 30000)

  it('comenzar desde inicio limpia la consulta anterior', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: 'Elegir ocasión' }))
    await user.click(screen.getByRole('button', { name: 'Adjuntar referencia' }))
    await user.click(screen.getByRole('button', { name: 'Comenzar una consulta' }))
    expect(window.location.hash).toBe('#/ocasion')
    expect(JSON.parse(screen.getByTestId('state').textContent!)).toEqual({ criteria: {}, photo: null })
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

    await user.upload(gallery, new File(['foto'], 'referencia.png', { type: 'image/png' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fotografía de referencia seleccionada' })).toHaveAttribute('src', 'blob:test-reference')

    vi.mocked(URL.revokeObjectURL).mockClear()
    await user.click(screen.getByRole('button', { name: 'Ver resultados' }))
    expect(screen.getByRole('heading', { name: 'Tus recomendaciones' })).toBeVisible()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-reference')
    expect(JSON.parse(screen.getByTestId('state').textContent!).photo).toBe('referencia.png')
  }, 30000)

  it('exige una ocasión y permite continuar sin foto con preferencias opcionales', async () => {
    const user = userEvent.setup()
    renderApp('/ocasion')
    await user.click(screen.getByRole('button', { name: 'Recomendar sin fotografía' }))
    expect(window.location.hash).toBe('#/ocasion')
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona una ocasión')
    await user.selectOptions(screen.getByLabelText('Ocasión (obligatoria)'), 'cumpleanos')
    await user.click(screen.getByRole('button', { name: 'Adjuntar referencia' }))
    await user.click(screen.getByRole('button', { name: 'Recomendar sin fotografía' }))
    expect(window.location.hash).toBe('#/resultados')
    expect(screen.getByRole('heading', { name: 'Cumpleaños entre amigas' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Rosa de cumpleaños' })).toBeVisible()
    expect(JSON.parse(screen.getByTestId('state').textContent!)).toEqual({
      criteria: { occasion: 'cumpleanos', style: 'sin_preferencia', makeup: 'sin_preferencia' }, photo: null,
    })
    await user.click(screen.getByRole('link', { name: 'Cambiar preferencias' }))
    expect(screen.getByLabelText('Ocasión (obligatoria)')).toHaveValue('cumpleanos')
    await user.selectOptions(screen.getByLabelText('Estilo de vestimenta (opcional)'), 'moderno')
    await user.click(screen.getByRole('button', { name: 'Recomendar sin fotografía' }))
    expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Cumpleaños contemporáneo')
    expect(screen.getAllByRole('heading', { level: 3 })[3]).toHaveTextContent('Brillo de celebración')
  }, 30000)
})
