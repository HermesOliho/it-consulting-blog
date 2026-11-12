import type { ReactNode } from 'react'

interface FieldProps {
  id: string // doit être identique à l'id de l'input placé dedans
  label: string
  error?: string
  hint?: string
  children: ReactNode // l'input, le select ou le textarea
}

export default function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}