import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../api/auth'
import { UNAUTHORIZED_EVENT } from '../lib/http'
import type { User } from '../types'

// Garde en mémoire l'utilisateur connecté et le partage à toute l'application
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  // Au démarrage : on demande au serveur si une session (cookie) existe déjà
  useEffect(() => {
    let cancelled = false

    getCurrentUser()
      .then((current) => {
        if (cancelled) return
        setUser(current)
        setStatus(current ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        // Serveur injoignable : on considère que personne n'est connecté
        if (cancelled) return
        setUser(null)
        setStatus('anonymous')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Si le serveur répond "401" pendant la navigation, la session a expiré : on déconnecte
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setStatus('anonymous')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await apiLogin(email, password)
    setUser(loggedIn)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      // Même si le serveur ne répond pas, on ferme la session à l'écran
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}