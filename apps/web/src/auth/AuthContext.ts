import { createContext } from 'react'
import type { User } from '../types'

// loading = on demande encore au serveur s'il existe une session
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

// Ce que tous les composants peuvent utiliser via useAuth()
export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)