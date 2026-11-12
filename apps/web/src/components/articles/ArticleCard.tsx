import { Link } from 'react-router-dom'
import type { Article } from '../../types'
import { formatDate } from '../../lib/format'
import './ArticleCard.css'

interface ArticleCardProps {
  article: Article
}

// Carte d'aperçu d'un article : image, catégorie, titre, résumé, auteur et date
export default function ArticleCard({ article }: ArticleCardProps) {
  const url = `/articles/${article.slug}`

  return (
    <article className="article-card">
      {/* Image cliquable (ignorée des lecteurs d'écran : le titre fait déjà le lien) */}
      <Link to={url} className="article-card__media" aria-hidden="true" tabIndex={-1}>
        {article.cover_image ? (
          <img src={article.cover_image} alt="" loading="lazy" />
        ) : (
          // Pas d'image : on affiche l'initiale du titre sur un fond doux
          <div className="article-card__placeholder">{article.title.charAt(0)}</div>
        )}
      </Link>

      {article.category && <p className="article-card__category">{article.category.name}</p>}

      <h3 className="article-card__title">
        <Link to={url}>{article.title}</Link>
      </h3>

      {/* React protège automatiquement contre les attaques XSS dans ce texte */}
      <p className="article-card__excerpt">{article.excerpt}</p>

      <p className="article-card__meta">
        {article.author.name} · {formatDate(article.published_at)}
      </p>
    </article>
  )
}