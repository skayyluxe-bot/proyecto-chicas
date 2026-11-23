import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'
import { ConsultationProvider } from './state/ConsultationContext'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ConsultationProvider>
        <AppRoutes />
      </ConsultationProvider>
    </HashRouter>
  </StrictMode>,
)
