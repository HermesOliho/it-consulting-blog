import { useState } from 'react'
import { FiCheck, FiMessageSquare } from 'react-icons/fi'
import { useAuth } from '../../../auth/useAuth'
import { approveComment } from '../../../api/comments'
import { usePendingComments } from '../../../hooks/usePendingComments'
import { getErrorMessage } from '../../../lib/http'
import { formatDate } from '../../../lib/format'
import UserBadge from '../../../components/comments/UserBadge'
import '../../../styles/admin.css'
import './CommentsAdminPage.css'

export default function CommentsAdminPage() {
  const { user } = useAuth()
  const { comments, isLoading, error, reload } = usePendingComments()
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <section className="container page">
        <h1>Accès réservé</h1>
        <p>La modération des commentaires est réservée à l’administration.</p>
      </section>
    )
  }

  async function handleApprove(id: number) {
    setApprovingId(id)
    setActionError('')
    setNotice('')
    try {
      await approveComment(id)
      setNotice('Le commentaire a été approuvé et publié.')
      reload()
    } catch (approveError) {
      setActionError(getErrorMessage(approveError))
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <section className="comments-admin">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Espace administrateur</p>
          <h1>Modération des commentaires</h1>
          <p>Les commentaires des visiteurs restent masqués jusqu’à leur approbation.</p>
        </div>
      </header>

      {actionError && <p className="comments-admin__error" role="alert">{actionError}</p>}
      {notice && <p className="comments-admin__notice" role="status">{notice}</p>}
      {error && (
        <div className="comments-admin__error" role="alert">
          <p>{error}</p>
          <button className="btn btn--ghost" onClick={reload} type="button">Réessayer</button>
        </div>
      )}

      {isLoading ? (
        <p role="status">Chargement des commentaires en attente…</p>
      ) : !error && comments.length === 0 ? (
        <div className="comments-admin__empty">
          <FiMessageSquare aria-hidden="true" />
          <h2>Aucun commentaire en attente</h2>
        </div>
      ) : (
        <ul className="comments-admin__list">
          {comments.map((comment) => (
            <li className="comments-admin__item" key={comment.id}>
              <div className="comments-admin__meta">
                <strong>{comment.author.name}</strong>
                <UserBadge user={comment.author} />
                <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
              </div>
              <p className="comments-admin__content">{comment.content}</p>
              <p className="comments-admin__article">Article no {comment.article_id}</p>
              <button
                className="btn btn--primary comments-admin__approve"
                disabled={approvingId === comment.id}
                onClick={() => void handleApprove(comment.id)}
                type="button"
              >
                <FiCheck aria-hidden="true" />
                {approvingId === comment.id ? 'Approbation…' : 'Approuver et publier'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
