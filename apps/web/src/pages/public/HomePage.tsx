import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from '../../components/articles/ArticleCard'
import HeroSection from '../../components/home/HeroSection'
import { listArticles, listCategories } from '../../api/articles'
import type { Article, Category } from '../../types'
import './HomePage.css'

type LoadStatus = 'loading' | 'error' | 'ready'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

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

  function retry() {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }

  return (
    <>
      <HeroSection />

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

      {categories.length > 0 && (
        <section id="themes" className="home-section container" aria-labelledby="themes-title">
          <h2 id="themes-title" className="script-title">
            explorer par thème
          </h2>
          <ul className="home-chips">
            {categories.map((category) => (
              <li key={category.id}>
                <Link className="home-chip" to={`/articles?category=${category.slug}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

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
