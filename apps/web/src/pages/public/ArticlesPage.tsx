import { useEffect, useState, type FormEvent } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import ArticleCard from '../../components/articles/ArticleCard'
import { listArticles, listCategories } from '../../api/articles'
import { getErrorMessage } from '../../lib/http'
import type { Article, Category, Paginated } from '../../types'
import './ArticlesPage.css'

const PAGE_SIZE = 9

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [response, setResponse] = useState<{
    key: string
    result: Paginated<Article> | null
    error: string | null
  }>({ key: '', result: null, error: null })
  const [categories, setCategories] = useState<Category[]>([])
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${page}\u0000${search}\u0000${category}\u0000${attempt}`
  const isLoading = response.key !== requestKey
  const result = isLoading ? null : response.result
  const errorMessage = isLoading ? null : response.error

  useEffect(() => {
    let cancelled = false

    Promise.all([
      listArticles({ page, limit: PAGE_SIZE, search, category: category || undefined }),
      listCategories(),
    ])
      .then(([articles, articleCategories]) => {
        if (cancelled) return
        setCategories(articleCategories)
        setResponse({ key: requestKey, result: articles, error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setResponse({ key: requestKey, result: null, error: getErrorMessage(error) })
      })

    return () => {
      cancelled = true
    }
  }, [attempt, category, page, requestKey, search])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const next = new URLSearchParams(searchParams)
    const term = String(formData.get('search') ?? '').trim()
    if (term) next.set('search', term)
    else next.delete('search')
    next.delete('page')
    setSearchParams(next)
  }

  function updateCategory(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('category', value)
    else next.delete('category')
    next.delete('page')
    setSearchParams(next)
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1

  return (
    <section className="container page articles-page">
      <header className="articles-page__header">
        <p className="eyebrow">Le blog IT-Consulting</p>
        <h1>Nos articles</h1>
        <p>Des idées claires et des conseils utiles pour mieux comprendre le numérique.</p>
      </header>

      <div className="articles-page__filters">
        <form className="articles-page__search" onSubmit={submitSearch} role="search">
          <label className="sr-only" htmlFor="articles-search">Rechercher un article</label>
          <input
            className="input"
            id="articles-search"
            key={search}
            maxLength={100}
            name="search"
            placeholder="Rechercher un article…"
            defaultValue={search}
          />
          <button aria-label="Lancer la recherche" className="btn btn--primary" type="submit">
            <FiSearch aria-hidden="true" />
          </button>
        </form>

        <label className="articles-page__category">
          <span>Thème</span>
          <select
            className="input"
            onChange={(event) => updateCategory(event.target.value)}
            value={category}
          >
            <option value="">Tous les thèmes</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && (
        <div aria-label="Chargement des articles" aria-busy="true" className="articles-page__grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="article-skeleton" key={index}>
              <div className="article-skeleton__media" />
              <div className="article-skeleton__line" />
              <div className="article-skeleton__line article-skeleton__line--short" />
              <div className="article-skeleton__line" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="articles-page__message" role="alert">
          <p>{errorMessage}</p>
          <button className="btn btn--ghost" onClick={() => setAttempt((value) => value + 1)} type="button">
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && result?.data.length === 0 && (
        <p className="articles-page__message">Aucun article ne correspond à cette recherche.</p>
      )}

      {!isLoading && !errorMessage && result && result.data.length > 0 && (
        <>
          <div className="articles-page__grid">
            {result.data.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Pagination des articles" className="articles-page__pagination">
              <button
                className="btn btn--ghost"
                disabled={page <= 1}
                onClick={() => setSearchParams((current) => {
                  current.set('page', String(page - 1))
                  return current
                })}
                type="button"
              >
                Précédent
              </button>
              <span>Page {page} sur {totalPages}</span>
              <button
                className="btn btn--ghost"
                disabled={page >= totalPages}
                onClick={() => setSearchParams((current) => {
                  current.set('page', String(page + 1))
                  return current
                })}
                type="button"
              >
                Suivant
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
