import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import '../../styles/admin.css'

// Page d'arrivée après la connexion (version provisoire)
export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Bonjour {user?.name}</h1>
          <p>Bienvenue dans l'espace d'administration.</p>
        </div>
      </header>

      <ul className="admin-shortcuts">
        <li>
          <Link to="/admin/articles">
            <strong>Articles</strong>
            <span>Rédiger, publier et gérer les articles</span>
          </Link>
        </li>
        {/* Ce raccourci n'apparaît que pour le super administrateur */}
        {user?.role === 'SUPER_ADMIN' && (
          <li>
            <Link to="/admin/users">
              <strong>Utilisateurs</strong>
              <span>Gérer les comptes administrateurs</span>
            </Link>
          </li>
        )}
      </ul>
    </>
  )
}