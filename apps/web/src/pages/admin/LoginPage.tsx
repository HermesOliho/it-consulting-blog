import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import Field from '../../components/ui/Field'
import { getErrorMessage } from '../../lib/http'
import { isValidEmail } from '../../lib/validation'
import '../../styles/forms.css'
import './LoginPage.css'

// Choisit la page où renvoyer l'utilisateur après la connexion.
// On n'accepte QUE les pages de l'espace admin : ça évite qu'un lien piégé
// renvoie l'utilisateur vers un site extérieur (faille "open redirect").
function safeTarget(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from
  return typeof from === 'string' && from.startsWith('/admin') ? from : '/admin'
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Déjà connecté (ou connexion réussie à l'instant) : on quitte cette page
  if (user) return <Navigate to={safeTarget(location.state)} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // empêche le rechargement de la page

    // 1) Vérifications côté navigateur
    const found: { email?: string; password?: string } = {}
    if (!isValidEmail(email.trim())) found.email = 'Saisissez une adresse e-mail valide.'
    if (!password) found.password = 'Saisissez votre mot de passe.'
    setErrors(found)
    setSubmitError('')
    if (Object.keys(found).length > 0) return

    // 2) Envoi au serveur
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      // Succès : "user" est maintenant renseigné, la redirection se fait toute seule (ligne plus haut)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      setPassword('') // on vide le mot de passe après un échec
      setSubmitting(false)
    }
  }

  return (
    <section className="container page">
      <div className="login card">
        <h1>Espace administrateur</h1>
        <p className="login__intro">
          Connectez-vous pour gérer le blog. Les comptes sont créés par un super administrateur.
        </p>

        {submitError && (
          <p className="alert" role="alert">
            {submitError}
          </p>
        )}

        {/* noValidate : on affiche NOS messages en français plutôt que ceux du navigateur */}
        <form onSubmit={handleSubmit} noValidate>
          <Field id="email" label="Adresse e-mail" error={errors.email}>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </Field>

          <Field id="password" label="Mot de passe" error={errors.password}>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={128}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </Field>

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </section>
  )
}