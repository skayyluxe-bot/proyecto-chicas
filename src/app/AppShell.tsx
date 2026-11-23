import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

export function AppShell() {
  const { pathname } = useLocation()
  const content = useRef<HTMLElement>(null)
  useEffect(() => {
    const heading = content.current?.querySelector('h1')?.textContent
    document.title = heading ? `${heading} | Beauty & Fashion` : 'Beauty & Fashion'
    content.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#contenido" onClick={event => {
        event.preventDefault()
        content.current?.focus()
      }}>Saltar al contenido</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">Beauty &amp; Fashion</Link>
          <nav className="main-nav" aria-label="Navegación principal">
            <NavLink to="/" end>Inicio</NavLink>
            <NavLink to="/ocasion">Consulta</NavLink>
            <NavLink to="/catalogo">Catálogo</NavLink>
          </nav>
        </div>
      </header>
      <main id="contenido" className="page-container" ref={content} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">Beauty &amp; Fashion · Un estilo para cada ocasión.</footer>
    </>
  )
}
