import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { HomePage } from '../pages/HomePage'
import { OccasionPage } from '../pages/OccasionPage'
import { PhotoPage } from '../pages/PhotoPage'
import { ResultsPage } from '../pages/ResultsPage'
import { CatalogPage } from '../pages/CatalogPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="ocasion" element={<OccasionPage />} />
        <Route path="foto" element={<PhotoPage />} />
        <Route path="resultados" element={<ResultsPage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
