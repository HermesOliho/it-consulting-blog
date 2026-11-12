import { useContext } from 'react'
import { AuthContext } from './AuthContext'

// Utilisation : const { user, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>.")
  }
  return context
}