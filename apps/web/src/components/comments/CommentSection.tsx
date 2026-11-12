import { useState, type FormEvent } from 'react'
import { FiMessageCircle, FiSend } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { createComment } from '../../api/comments'
import { getErrorMessage } from '../../lib/http'
import type { BlogComment, CommentIdentity } from '../../types/comments'
import UserBadge from './UserBadge'
import { useArticleComments } from '../../hooks/useArticleComments'
import './CommentSection.css'

interface CommentSectionProps {
  articleId: number
  currentUser: CommentIdentity | null
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function CommentSection({ articleId, currentUser }: CommentSectionProps) {
  const { comments, isLoading, error, reload } = useArticleComments(articleId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentUser) return

    const form = event.currentTarget
    const content = String(new FormData(form).get('content') ?? '').trim()
    if (content.length < 2) return

    setIsSubmitting(true)
    setSubmitError('')
    setNotice('')
    try {
      const created: BlogComment = await createComment(articleId, content, currentUser)
      form.reset()
      reload()
      setNotice(
        created.isApproved
          ? 'Ton commentaire est publié.'
          : 'Ton commentaire a été envoyé et apparaîtra après validation par un administrateur.',
      )
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="comment-section" aria-labelledby="comments-title">
      <div>
        <p className="eyebrow">La conversation</p>
        <h2 id="comments-title">
          Commentaires <span className="comment-section__count">({comments.length})</span>
        </h2>

        {isLoading ? (
          <p role="status">Chargement des commentaires…</p>
        ) : error ? (
          <div className="comment-form__error" role="alert">
            <p>{error}</p>
            <button className="btn btn--ghost" onClick={reload} type="button">Réessayer</button>
          </div>
        ) : comments.length ? (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li className="comment" key={comment.id}>
                <div className="comment__heading">
                  <strong>{comment.author.name}</strong>
                  <UserBadge user={comment.author} />
                  <time dateTime={comment.created_at}>
                    {dateFormatter.format(new Date(comment.created_at))}
                  </time>
                </div>
                <p>{comment.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="comment-section__empty">Aucun commentaire publié pour le moment.</p>
        )}
      </div>

      <div className="comment-form-wrap">
        <h3 className="comment-form-wrap__title">
          <FiMessageCircle aria-hidden="true" /> Ajouter un commentaire
        </h3>
        {currentUser ? (
          <form className="comment-form" onSubmit={handleSubmit}>
            <p>
              Connecté en tant que <strong>{currentUser.name}</strong>.{' '}
              {currentUser.role === 'VISITOR' &&
                'Ton commentaire sera visible après validation par un administrateur.'}
            </p>
            <label htmlFor={`comment-content-${articleId}`}>Ton commentaire</label>
            <textarea
              className="input comment-form__textarea"
              id={`comment-content-${articleId}`}
              maxLength={2000}
              minLength={2}
              name="content"
              placeholder="Partage ton point de vue…"
              required
              rows={5}
            />
            {submitError && <p className="comment-form__error" role="alert">{submitError}</p>}
            {notice && <p className="comment-form__notice" role="status">{notice}</p>}
            <button className="btn btn--primary" disabled={isSubmitting} type="submit">
              <FiSend aria-hidden="true" />
              {isSubmitting ? 'Envoi en cours…' : 'Envoyer le commentaire'}
            </button>
          </form>
        ) : (
          <div className="comment-signin">
            <p>Connecte-toi pour participer à la conversation.</p>
            <Link className="btn btn--primary" to="/admin/login">
              Se connecter
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
