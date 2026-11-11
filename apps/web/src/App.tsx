import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/public/HomePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Toutes les pages ci-dessous partagent le même Layout (footer inclus) */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        {/* Les routes des autres étapes (login, admin...) s'ajouteront ici */}

        {/* "*" = toute adresse inconnue → page 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}