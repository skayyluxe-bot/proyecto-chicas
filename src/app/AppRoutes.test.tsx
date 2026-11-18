import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'
import { ConsultationProvider, useConsultation } from '../state/ConsultationContext'

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

beforeEach(() => { window.location.hash = '/' })

describe('Rutas y consulta compartida', () => {
  it.each([
    ['/', 'Tu ocasión.Tu propio estilo.'],
    ['/ocasion', 'Ocasión y preferencias'],
    ['/foto', 'Fotografía opcional'],
    ['/resultados', 'Tus recomendaciones'],
    ['/catalogo', 'Catálogo'],
  ])('abre directamente %s', (path, title) => {
    renderApp(path)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title)
    expect(screen.getByRole('main')).toHaveFocus()
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
    await user.click(screen.getByRole('link', { name: 'Ver el paso de fotografía' }))
    await user.click(screen.getByRole('link', { name: 'Ver la pantalla de resultados' }))
    expect(JSON.parse(screen.getByTestId('state').textContent!)).toEqual(expected)
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
})
