import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[] // si absent : tout administrateur connecté est accepté
}

// Garde d'entrée : affiche les pages enfants seulement si l'utilisateur y a droit.
// ATTENTION : c'est un confort d'affichage. La vraie protection est faite par le backend (RG02).
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, status } = useAuth()
  const location = useLocation()

  // On attend la réponse du serveur avant de décider (évite un faux renvoi vers la connexion)
  if (status === 'loading') {
    return (
      <p className="container page" role="status">
        Vérification de la session…
      </p>
    )
  }

  // Pas connecté : direction la page de connexion (on retient la page demandée)
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  // Connecté mais pas le bon rôle
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <section className="container page">
        <h1>Accès refusé</h1>
        <p>Votre rôle ne vous permet pas d'accéder à cette page.</p>
        <Link to="/admin" className="btn btn--primary">
          Retour au tableau de bord
        </Link>
      </section>
    )
  }

  return <Outlet />
}