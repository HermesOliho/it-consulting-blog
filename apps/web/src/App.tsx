import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import HomePage from './pages/public/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import UsersPage from './pages/admin/users/UsersPage'
import UserFormPage from './pages/admin/users/UserFormPage'

export default function App() {
  return (
    <Routes>
      {/* ===== Espace PUBLIC (Header + Footer) ===== */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        {/* Les pages publiques des collègues (articles, détail...) s'ajoutent ici */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ===== Espace ADMINISTRATEUR : réservé aux utilisateurs connectés ===== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />

          {/* Pages réservées au SUPER_ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/users/new" element={<UserFormPage />} />
            <Route path="/admin/users/:id/edit" element={<UserFormPage />} />
          </Route>

          {/* Les routes admin de l'étape 5 et des collègues s'ajoutent ici */}
        </Route>
      </Route>
    </Routes>
  )
}