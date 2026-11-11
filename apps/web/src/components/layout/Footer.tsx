import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  // L'année se met à jour toute seule
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__grid">
        {/* Colonne 1 : identité du blog (texte à adapter) */}
        <div>
          <p className="footer__logo">it-consulting blog</p>
          <p className="footer__tagline">
            Des articles pour comprendre, apprendre et avancer.
          </p>
        </div>

        {/* Colonne 2 : navigation (ajuste les liens quand les routes existeront) */}
        <nav aria-label="Navigation du pied de page">
          <h2 className="footer__title">Explorer</h2>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/articles">Articles</Link></li>
          </ul>
        </nav>

        {/* Colonne 3 : accès discret à l'espace administrateur */}
        <nav aria-label="Administration">
          <h2 className="footer__title">Administration</h2>
          <ul>
            <li><Link to="/admin/login">Espace administrateur</Link></li>
          </ul>
        </nav>
      </div>

      {/* Bandeau du bas : copyright */}
      <div className="footer__bottom">
        <div className="container">
          <p>© {year} IT-Consulting Blog. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}