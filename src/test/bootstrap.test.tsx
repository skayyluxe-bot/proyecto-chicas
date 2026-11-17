import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Entorno de pruebas', () => {
  it('renderiza React en el DOM y dispone de los matchers de accesibilidad', () => {
    render(<button type="button">Comenzar consulta</button>)
    expect(screen.getByRole('button', { name: 'Comenzar consulta' })).toBeVisible()
  })
})
