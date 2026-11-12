import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteArticle,
  listAdminArticles,
  setArticleStatus,
} from '../../../api/adminArticles'
import { getErrorMessage } from '../../../lib/http'
import { formatDate } from '../../../lib/format'
import { ARTICLE_STATUS_LABELS } from '../../../lib/labels'
import type { Article, ArticleStatus, Paginated } from '../../../types'
import '../../../styles/admin.css'

type LoadStatus = 'loading' | 'error' | 'ready'
type StatusFilter = 'ALL' | ArticleStatus

const PAGE_SIZE = 10 // articles par page (la pagination est demandée par le cahier des charges)
const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'PUBLISHED', label: 'Publiés' },
  { value: 'DRAFT', label: 'Brouillons' },
]

// Liste des articles de l'administration : filtrer, publier, dépublier, modifier, supprimer
export default function ArticlesAdminPage() {
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<Paginated<Article> | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [attempt, setAttempt] = useState(0) // augmenté pour recharger la liste
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  // Chargement : se relance quand le filtre, la page ou "attempt" change
  useEffect(() => {
    let cancelled = false

    listAdminArticles({
      page,
      limit: PAGE_SIZE,
      status: filter === 'ALL' ? undefined : filter,
    })
      .then((data) => {
        if (cancelled) return
        setResult(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [filter, page, attempt])

  function changeFilter(next: StatusFilter) {
    setFilter(next)
    setPage(1)
    setStatus('loading')
  }

  function goToPage(next: number) {
    setPage(next)
    setStatus('loading')
  }

  function retry() {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  // Publie un brouillon, ou repasse un article publié en brouillon
  async function togglePublish(article: Article) {
    setActionError('')
    setBusyId(article.id)
    try {
      await setArticleStatus(article.id, article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
      setAttempt((n) => n + 1) // recharge la liste
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  async function remove(article: Article) {
    if (!window.confirm(`Supprimer définitivement « ${article.title} » ?`)) return
    setActionError('')
    setBusyId(article.id)
    try {
      await deleteArticle(article.id)
      // Si c'était le dernier article de la page, on recule d'une page
      if (result && result.data.length === 1 && page > 1) setPage(page - 1)
      setAttempt((n) => n + 1)
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Articles</h1>
          <p>Rédigez, publiez et gérez les articles du blog.</p>
        </div>
        <Link to="/admin/articles/new" className="btn btn--primary">
          Nouvel article
        </Link>
      </header>

      {/* Filtre par statut */}
      <div className="tabs" role="group" aria-label="Filtrer par statut">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="tab"
            aria-pressed={filter === f.value}
            onClick={() => changeFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="alert" role="alert">
          {actionError}
        </p>
      )}

      {status === 'loading' && (
        <p className="admin-message" role="status">
          Chargement des articles…
        </p>
      )}

      {status === 'error' && (
        <div className="admin-message" role="alert">
          <p>Impossible de charger les articles.</p>
          <button type="button" className="btn btn--ghost" onClick={retry}>
            Réessayer
          </button>
        </div>
      )}

      {status === 'ready' && result && result.data.length === 0 && (
        <p className="admin-message">Aucun article ici pour le moment.</p>
      )}

      {status === 'ready' && result && result.data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Auteur</th>
                <th>Statut</th>
                <th>Date</th>
                <th>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((article) => {
                const published = article.status === 'PUBLISHED'
                return (
                  <tr key={article.id}>
                    <td>
                      {article.title}
                      <span className="table__sub">/articles/{article.slug}</span>
                    </td>
                    <td>{article.category?.name ?? '—'}</td>
                    <td>{article.author.name}</td>
                    <td>
                      <span className={`badge${published ? ' badge--success' : ''}`}>
                        {ARTICLE_STATUS_LABELS[article.status]}
                      </span>
                    </td>
                    <td>
                      {published
                        ? formatDate(article.published_at)
                        : `modifié le ${formatDate(article.updated_at)}`}
                    </td>
                    <td>
                      <div className="table__actions">
                        <Link
                          to={`/admin/articles/${article.id}/edit`}
                          className="btn btn--ghost btn--small"
                        >
                          Modifier
                        </Link>
                        <button
                          type="button"
                          className="btn btn--ghost btn--small"
                          disabled={busyId === article.id}
                          onClick={() => togglePublish(article)}
                        >
                          {published ? 'Dépublier' : 'Publier'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--small"
                          disabled={busyId === article.id}
                          onClick={() => remove(article)}
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

      {/* Pagination */}
      {status === 'ready' && result && result.total > 0 && (
        <nav className="pagination" aria-label="Pagination">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Précédent
          </button>
          <span>
            Page {page} sur {totalPages}
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Suivant
          </button>
        </nav>
      )}
    </>
  )
}