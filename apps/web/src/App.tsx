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
import ArticlesAdminPage from './pages/admin/articles/ArticlesAdminPage'
import ArticleEditorPage from './pages/admin/articles/ArticleEditorPage'
import CommentsAdminPage from './pages/admin/comments/CommentsAdminPage'
import ArticlesPage from './pages/public/ArticlesPage'
import ArticleDetailPage from './pages/public/ArticleDetailPage'
import type { CommentIdentity } from './types/comments'

interface AppProps {
  commentUser?: CommentIdentity | null
}

export default function App({ commentUser }: AppProps) {
  return (
    <Routes>
      {/* ===== Espace PUBLIC (Header + Footer) ===== */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage commentUser={commentUser} />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ===== Espace ADMINISTRATEUR : réservé aux utilisateurs connectés ===== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />

          {/* Articles : tout administrateur connecté */}
          <Route path="/admin/articles" element={<ArticlesAdminPage />} />
          <Route path="/admin/articles/new" element={<ArticleEditorPage />} />
          <Route path="/admin/articles/:id/edit" element={<ArticleEditorPage />} />
          <Route path="/admin/comments" element={<CommentsAdminPage />} />

          {/* Pages réservées au SUPER_ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/users/new" element={<UserFormPage />} />
            <Route path="/admin/users/:id/edit" element={<UserFormPage />} />
          </Route>

          {/* Les routes des collègues (commentaires, profil...) s'ajoutent ici */}
        </Route>
      </Route>
    </Routes>
  )
}