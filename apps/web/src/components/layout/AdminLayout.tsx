import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { ROLE_LABELS } from '../../lib/labels'
import type { UserRole } from '../../types'
import './AdminLayout.css'

interface AdminLink {
  to: string
  label: string
  end?: boolean // true = actif seulement sur cette adresse exacte
  roles?: UserRole[] // si présent : lien visible seulement pour ces rôles
}

// Menu de l'espace admin. Les collègues ajoutent ici leurs pages
// (commentaires, profil...) en ajoutant simplement une ligne.
const ADMIN_LINKS: AdminLink[] = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/articles', label: 'Articles' },
  { to: '/admin/comments', label: 'Commentaires' },
  { to: '/admin/users', label: 'Utilisateurs', roles: ['SUPER_ADMIN'] },
]

// Structure commune à toutes les pages de l'administration
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // On n'affiche que les liens autorisés pour le rôle de l'utilisateur
  const links = ADMIN_LINKS.filter(
    (link) => !link.roles || (user !== null && link.roles.includes(user.role)),
  )

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Même en cas d'erreur réseau, la session est fermée à l'écran
    }
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <aside className="admin__side">
        <Link to="/" className="admin__brand">
          it-consulting blog
        </Link>

        <nav className="admin__nav" aria-label="Administration">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__user">
          <p className="admin__name">{user?.name}</p>
          <p className="admin__role">{user ? ROLE_LABELS[user.role] : ''}</p>
          <Link to="/" className="admin__site">
            ← Voir le site
          </Link>
          <button type="button" className="btn btn--ghost admin__logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}