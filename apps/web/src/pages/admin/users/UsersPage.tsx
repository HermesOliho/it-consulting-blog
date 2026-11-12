import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../auth/useAuth'
import { deleteUser, listUsers, updateUser } from '../../../api/users'
import { getErrorMessage } from '../../../lib/http'
import { formatDate } from '../../../lib/format'
import { ROLE_LABELS, USER_STATUS_LABELS } from '../../../lib/labels'
import type { User } from '../../../types'
import '../../../styles/admin.css'

type LoadStatus = 'loading' | 'error' | 'ready'

// Liste des comptes administrateurs + actions (modifier, activer/désactiver, supprimer)
export default function UsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [attempt, setAttempt] = useState(0) // augmenté pour relancer le chargement
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null) // compte en cours de traitement

  // Chargement de la liste
  useEffect(() => {
    let cancelled = false

    listUsers()
      .then((data) => {
        if (cancelled) return
        setUsers(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  // Active ou désactive un compte
  async function toggleStatus(target: User) {
    setActionError('')
    setBusyId(target.id)
    try {
      const updated = await updateUser(target.id, {
        status: target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      })
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  // Supprime un compte après confirmation
  async function remove(target: User) {
    if (!window.confirm(`Supprimer définitivement le compte de ${target.name} ?`)) return
    setActionError('')
    setBusyId(target.id)
    try {
      await deleteUser(target.id)
      setUsers((list) => list.filter((u) => u.id !== target.id))
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Utilisateurs</h1>
          <p>Gérez les comptes administrateurs du blog.</p>
        </div>
        <Link to="/admin/users/new" className="btn btn--primary">
          Nouvel administrateur
        </Link>
      </header>

      {actionError && (
        <p className="alert" role="alert">
          {actionError}
        </p>
      )}

      {status === 'loading' && (
        <p className="admin-message" role="status">
          Chargement des utilisateurs…
        </p>
      )}

      {status === 'error' && (
        <div className="admin-message" role="alert">
          <p>Impossible de charger les utilisateurs.</p>
          <button type="button" className="btn btn--ghost" onClick={retry}>
            Réessayer
          </button>
        </div>
      )}

      {status === 'ready' && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === me?.id // on ne peut pas agir sur son propre compte ici
                return (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{ROLE_LABELS[u.role]}</td>
                    <td>
                      <span className={`badge${u.status === 'ACTIVE' ? ' badge--success' : ''}`}>
                        {USER_STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      <div className="table__actions">
                        <Link to={`/admin/users/${u.id}/edit`} className="btn btn--ghost btn--small">
                          Modifier
                        </Link>
                        <button
                          type="button"
                          className="btn btn--ghost btn--small"
                          disabled={isMe || busyId === u.id}
                          onClick={() => toggleStatus(u)}
                        >
                          {u.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--small"
                          disabled={isMe || busyId === u.id}
                          onClick={() => remove(u)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}