import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CatalogPage } from '../CatalogPage'

describe('Catálogo visual', () => {
  it('muestra las 25 opciones con imágenes y permite filtrar por categoría', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CatalogPage /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('25 opciones')
    expect(screen.getAllByRole('img')).toHaveLength(25)
    await user.selectOptions(screen.getByLabelText('Categoría'), 'outfit')
    expect(screen.getByRole('status')).toHaveTextContent('15 opciones')
    expect(screen.getAllByRole('img')).toHaveLength(15)
    await user.selectOptions(screen.getByLabelText('Categoría'), 'makeup')
    expect(screen.getByRole('status')).toHaveTextContent('10 opciones')
    expect(screen.getAllByRole('img')).toHaveLength(10)
  }, 30000)

  it('combina categoría y búsqueda sin distinguir tildes, mayúsculas o espacios', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CatalogPage /></MemoryRouter>)
    await user.selectOptions(screen.getByLabelText('Categoría'), 'makeup')
    await user.type(screen.getByRole('searchbox'), '  GRADUACION  ')
    expect(screen.getByRole('status')).toHaveTextContent('2 opciones')
    expect(screen.getByRole('heading', { name: 'Retrato luminoso' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Noche de graduación' })).toBeVisible()
    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'xyz-inexistente')
    expect(screen.getByRole('heading', { name: 'No encontramos coincidencias' })).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('0 opciones')
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getByRole('status')).toHaveTextContent('25 opciones')
    expect(screen.getByRole('searchbox')).toHaveValue('')
  }, 30000)
})
