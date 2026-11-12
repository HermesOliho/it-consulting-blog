import { ApiError, http } from '../lib/http'
import { USE_MOCK } from '../lib/config'
import type { User } from '../types'

// POST /api/auth/login : le serveur pose un cookie de session sécurisé
export async function login(email: string, password: string): Promise<User> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.login(email, password)
  }
  const response = await http<{ user: User }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  return response.user
}

// POST /api/auth/logout : le serveur supprime le cookie de session
export async function logout(): Promise<void> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.logout()
  }
  await http<void>('/auth/logout', { method: 'POST' })
}

// GET /api/auth/me : "qui suis-je ?" (renvoie null si personne n'est connecté)
export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.currentUser()
  }
  try {
    const response = await http<{ user: User } | null>('/auth/me')
    return response?.user ?? null
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}