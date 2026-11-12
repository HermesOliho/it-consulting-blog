import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FiCompass } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import './HeroSection.css'

export default function HeroSection() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = search.trim()
    navigate(term ? `/articles?search=${encodeURIComponent(term)}` : '/articles')
  }

  return (
    <motion.section
      className="home-hero container hero"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <motion.p
        className="home-hero__hello"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <FiCompass aria-hidden="true" className="mr-2 inline-block align-middle text-xl" />
        bienvenue
      </motion.p>
      <motion.h1
        className="home-hero__title"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        Installez-vous, il y a toujours quelque chose à découvrir
      </motion.h1>
      <motion.p
        className="home-hero__text"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        Ici, on parle de technologie simplement : des idées claires, des conseils utiles
        et le plaisir d'apprendre ensemble. Prenez votre temps, et n'hésitez pas à
        donner votre avis.
      </motion.p>

      <form className="home-search" onSubmit={handleSearch} role="search">
        <input
          className="input"
          type="search"
          placeholder="Que souhaitez-vous découvrir ?"
          aria-label="Rechercher un article"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          maxLength={100}
        />
        <button type="submit" className="btn btn--primary">
          Rechercher
        </button>
      </form>

      <Link to="/articles" className="home-link">
        Ou parcourez tous les articles →
      </Link>
    </motion.section>
  )
}
