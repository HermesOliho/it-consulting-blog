import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { getArticleById } from '../../api/articles'
import { getErrorMessage } from '../../lib/http'
import { formatDate } from '../../lib/format'
import type { Article } from '../../types'
import './ArticleDetailPage.css'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const articleId = Number(id)
  const isValidId = Number.isInteger(articleId) && articleId > 0
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${articleId}.${attempt}`
  const [response, setResponse] = useState<{
    key: string
    article: Article | null
    error: string | null
  }>({ key: '', article: null, error: null })
  const isLoading = isValidId && response.key !== requestKey
  const article = response.key === requestKey ? response.article : null
  const errorMessage = isValidId && response.key === requestKey ? response.error : null

  useEffect(() => {
    let cancelled = false
    if (!isValidId) return

    getArticleById(articleId)
      .then((result) => {
        if (cancelled) return
        setResponse({ key: requestKey, article: result, error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setResponse({ key: requestKey, article: null, error: getErrorMessage(error) })
      })

    return () => {
      cancelled = true
    }
  }, [articleId, isValidId, requestKey])

  if (!isValidId) {
    return (
      <section className="container page">
        <div className="article-detail__message" role="alert">
          <h1>Article indisponible</h1>
          <p>Identifiant d’article invalide.</p>
        </div>
        <Link className="article-detail__back" to="/articles">
          <FiArrowLeft aria-hidden="true" /> Tous les articles
        </Link>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="container page">
        <p role="status">Chargement de l’article…</p>
      </section>
    )
  }

  if (errorMessage || !article) {
    return (
      <section className="container page">
        <div className="article-detail__message" role="alert">
          <h1>Article indisponible</h1>
          <p>{errorMessage || "Nous n'avons pas pu afficher cet article."}</p>
          <button className="btn btn--ghost" onClick={() => setAttempt((value) => value + 1)} type="button">
            Réessayer
          </button>
        </div>
        <Link className="article-detail__back" to="/articles">
          <FiArrowLeft aria-hidden="true" /> Tous les articles
        </Link>
      </section>
    )
  }

  return (
    <article className="container page article-detail">
      <Link className="article-detail__back" to="/articles">
        <FiArrowLeft aria-hidden="true" /> Tous les articles
      </Link>

      <header className="article-detail__header">
        {article.category && <p className="eyebrow">{article.category.name}</p>}
        <h1>{article.title}</h1>
        <p className="article-detail__excerpt">{article.excerpt}</p>
        <p className="article-detail__meta">
          {article.author.name} · {formatDate(article.published_at)}
        </p>
      </header>

      {article.cover_image && (
        <img alt="" className="article-detail__cover" src={article.cover_image} />
      )}

      <div className="article-detail__content">
        {article.content.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
        ))}
      </div>

    </article>
  )
}
