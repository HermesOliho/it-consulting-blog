import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ArticleCard from '../../components/articles/ArticleCard'
import { listArticles, listCategories } from '../../api/articles'
import type { Article, Category } from '../../types'
import './HomePage.css'

type LoadStatus = 'loading' | 'error' | 'ready'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [attempt, setAttempt] = useState(0) // augmenté pour relancer le chargement
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  // Chargement des 3 derniers articles et des catégories
  useEffect(() => {
    let cancelled = false // évite de modifier l'écran si la page a été quittée

    Promise.all([listArticles({ limit: 3 }), listCategories()])
      .then(([page, cats]) => {
        if (cancelled) return
        setArticles(page.data)
        setCategories(cats)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  // Bouton "Réessayer" après une erreur
  function retry() {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  // Envoi du formulaire de recherche : on redirige vers /articles?search=...
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // empêche le rechargement de la page
    const term = search.trim()
    navigate(term ? `/articles?search=${encodeURIComponent(term)}` : '/articles')
  }

  return (
    <>
      {/* ===== Bloc d'accueil chaleureux ===== */}
      <section className="home-hero container">
        <p className="home-hero__hello">bienvenue</p>
        <h1 className="home-hero__title">
          Installez-vous, il y a toujours quelque chose à découvrir
        </h1>
        <p className="home-hero__text">
          Ici, on parle de technologie simplement : des idées claires, des conseils utiles
          et le plaisir d'apprendre ensemble. Prenez votre temps, et n'hésitez pas à
          donner votre avis.
        </p>

        <form className="home-search" onSubmit={handleSearch} role="search">
          <input
            className="input"
            type="search"
            placeholder="Que souhaitez-vous découvrir ?"
            aria-label="Rechercher un article"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={100}
          />
          <button type="submit" className="btn btn--primary">
            Rechercher
          </button>
        </form>

        <Link to="/articles" className="home-link">
          Ou parcourez tous les articles →
        </Link>
      </section>

      {/* ===== Derniers articles ===== */}
      <section className="home-section container" aria-labelledby="latest-title">
        <div className="home-section__head">
          <h2 id="latest-title" className="script-title">
            derniers articles
          </h2>
          <Link to="/articles" className="home-link">
            Voir tout
          </Link>
        </div>

        {status === 'loading' && (
          <p className="home-message" role="status">
            Chargement des articles…
          </p>
        )}

        {status === 'error' && (
          <div className="home-message" role="alert">
            <p>Nous n'avons pas pu charger les articles.</p>
            <button type="button" className="btn btn--ghost" onClick={retry}>
              Réessayer
            </button>
          </div>
        )}

        {status === 'ready' && articles.length === 0 && (
          <p className="home-message">Les premiers articles arrivent bientôt.</p>
        )}

        {status === 'ready' && articles.length > 0 && (
          <div className="home-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* ===== Thèmes (catégories) ===== */}
      {categories.length > 0 && (
        <section id="themes" className="home-section container" aria-labelledby="themes-title">
          <h2 id="themes-title" className="script-title">
            explorer par thème
          </h2>
          <ul className="home-chips">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link className="home-chip" to={`/articles?category=${cat.slug}`}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ===== Invitation à participer ===== */}
      <section className="home-welcome">
        <div className="container">
          <h2 className="script-title">une question, une idée ?</h2>
          <p>
            Chaque article accueille vos commentaires. Partagez votre avis, posez vos
            questions : nous lisons tout avec plaisir.
          </p>
          <Link to="/articles" className="btn btn--primary">
            Parcourir les articles
          </Link>
        </div>
      </section>
    </>
  )
}