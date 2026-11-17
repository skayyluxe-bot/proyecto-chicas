import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main>
      <h1>Beauty &amp; Fashion</h1>
      <p>Tu próxima ocasión, tu propio estilo.</p>
      <p>El entorno de desarrollo está listo. Próximamente podrás consultar outfits y maquillajes.</p>
    </main>
  </StrictMode>,
)
