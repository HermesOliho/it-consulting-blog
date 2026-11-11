import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import './Layout.css'

// Structure commune à toutes les pages : [Header] / contenu / Footer
export default function Layout() {
  return (
    <div className="layout">
      {/* EMPLACEMENT DU HEADER (navigation) : à ajouter ici par la personne qui s'en charge */}

      {/* <Outlet /> = l'endroit où s'affiche la page de la route courante */}
      <main className="layout__main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}