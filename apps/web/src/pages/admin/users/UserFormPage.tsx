import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../auth/useAuth'
import Field from '../../../components/ui/Field'
import { createUser, getUser, updateUser } from '../../../api/users'
import { getErrorMessage } from '../../../lib/http'
import { ROLE_LABELS, USER_STATUS_LABELS } from '../../../lib/labels'
import { PASSWORD_MIN_LENGTH, isValidEmail, isValidPassword } from '../../../lib/validation'
import type { UserRole, UserStatus } from '../../../types'
import '../../../styles/admin.css'

interface FormState {
  name: string
  email: string
  role: UserRole
  status: UserStatus
  password: string
}
type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = { name: '', email: '', role: 'ADMIN', status: 'ACTIVE', password: '' }

export default function UserFormPage() {
  const { id } = useParams() // présent seulement en modification
  const navigate = useNavigate()
  const { user: me } = useAuth()

  const userId = id ? Number(id) : null
  const isEdit = userId !== null
  const editingSelf = isEdit && me?.id === userId // on ne modifie pas son propre rôle/statut

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loadStatus, setLoadStatus] = useState<'loading' | 'error' | 'ready'>(
    isEdit ? 'loading' : 'ready',
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // En modification : on charge le compte pour pré-remplir le formulaire
  useEffect(() => {
    if (userId === null) return
    let cancelled = false

    getUser(userId)
      .then((found) => {
        if (cancelled) return
        setForm({
          name: found.name,
          email: found.email,
          role: found.role,
          status: found.status,
          password: '',
        })
        setLoadStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  // Met à jour un seul champ du formulaire
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Vérifie les champs avant l'envoi (le serveur revérifie : RG12)
  function validate(): FormErrors {
    const found: FormErrors = {}
    const name = form.name.trim()
    if (name.length < 2 || name.length > 100) {
      found.name = 'Le nom doit contenir entre 2 et 100 caractères.'
    }
    if (!isValidEmail(form.email.trim())) {
      found.email = 'Saisissez une adresse e-mail valide.'
    }
    // Mot de passe obligatoire à la création, facultatif en modification
    const mustCheckPassword = !isEdit || form.password !== ''
    if (mustCheckPassword && !isValidPassword(form.password)) {
      found.password = `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
    }
    return found
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    setSubmitError('')
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      if (userId === null) {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        })
      } else {
        await updateUser(userId, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.status,
          // le mot de passe n'est envoyé que s'il a été saisi
          ...(form.password ? { password: form.password } : {}),
        })
      }
      navigate('/admin/users')
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>{isEdit ? 'Modifier le compte' : 'Nouvel administrateur'}</h1>
          <p>
            <Link to="/admin/users">← Retour aux utilisateurs</Link>
          </p>
        </div>
      </header>

      {loadStatus === 'loading' && (
        <p className="admin-message" role="status">
          Chargement…
        </p>
      )}
      {loadStatus === 'error' && (
        <p className="admin-message" role="alert">
          Ce compte est introuvable ou inaccessible.
        </p>
      )}

      {loadStatus === 'ready' && (
        <form className="card form-card" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <p className="alert" role="alert">
              {submitError}
            </p>
          )}

          <Field id="name" label="Nom complet" error={errors.name}>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              maxLength={100}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
          </Field>

          <Field id="email" label="Adresse e-mail" error={errors.email}>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </Field>

          <div className="form-row form-row--2">
            <Field
              id="role"
              label="Rôle"
              hint={editingSelf ? 'Vous ne pouvez pas modifier votre propre rôle.' : undefined}
            >
              <select
                id="role"
                className="input"
                value={form.role}
                onChange={(e) => update('role', e.target.value as UserRole)}
                disabled={editingSelf}
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </Field>

            {/* Le statut ne se choisit qu'en modification (un nouveau compte est actif) */}
            {isEdit && (
              <Field id="status" label="Statut">
                <select
                  id="status"
                  className="input"
                  value={form.status}
                  onChange={(e) => update('status', e.target.value as UserStatus)}
                  disabled={editingSelf}
                >
                  {(Object.keys(USER_STATUS_LABELS) as UserStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {USER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <Field
            id="password"
            label={isEdit ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe'}
            error={errors.password}
            hint={
              isEdit
                ? 'Laissez vide pour conserver le mot de passe actuel.'
                : `Au moins ${PASSWORD_MIN_LENGTH} caractères.`
            }
          >
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              maxLength={128}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </Field>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le compte'}
            </button>
            <Link to="/admin/users" className="btn btn--ghost">
              Annuler
            </Link>
          </div>
        </form>
      )}
    </>
  )
}