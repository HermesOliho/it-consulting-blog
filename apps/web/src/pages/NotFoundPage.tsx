import { Link } from 'react-router-dom'

// Affichée quand l'adresse tapée n'existe pas
export default function NotFoundPage() {
  return (
    <section className="container page">
      <h1>Page introuvable</h1>
      <p>Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn btn--primary">Retour à l'accueil</Link>
    </section>
  )
}