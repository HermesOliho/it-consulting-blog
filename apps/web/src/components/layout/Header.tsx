import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import './Header.css'

// En-tête du site public : logo + navigation (menu repliable sur mobile)
export default function Header() {
  const [open, setOpen] = useState(false) // menu mobile ouvert ?
  const { user } = useAuth()
  const close = () => setOpen(false)

  return (
    <header className="header">
      <div className="container header__bar">
        <Link to="/" className="header__logo" onClick={close}>
          it-consulting blog
        </Link>

        {/* Bouton visible uniquement sur mobile */}
        <button
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Fermer' : 'Menu'}
        </button>

        <nav
          id="main-nav"
          className={`header__nav${open ? ' header__nav--open' : ''}`}
          aria-label="Navigation principale"
        >
          {/* NavLink ajoute automatiquement la classe "active" sur la page courante */}
          <NavLink to="/" end onClick={close}>
            Accueil
          </NavLink>
          <NavLink to="/articles" onClick={close}>
            Articles
          </NavLink>
          {/* Visible seulement quand un administrateur est connecté */}
          {user && (
            <NavLink to="/admin" onClick={close}>
              Espace admin
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}