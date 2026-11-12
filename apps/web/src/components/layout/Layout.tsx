import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'

// Structure commune aux pages PUBLIQUES : Header / contenu / Footer
export default function Layout() {
  return (
    <div className="layout">
      <Header />

      {/* <Outlet /> = l'endroit où s'affiche la page de la route courante */}
      <main className="layout__main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}