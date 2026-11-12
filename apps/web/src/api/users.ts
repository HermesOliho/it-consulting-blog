import { http } from '../lib/http'
import { USE_MOCK } from '../lib/config'
import type { User } from '../types'
import type { CreateUserInput, UpdateUserInput } from '../types/inputs'

// GET /api/users : liste des comptes administrateurs (SUPER_ADMIN uniquement)
export async function listUsers(): Promise<User[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.listUsers()
  }
  return http<User[]>('/users')
}

// GET /api/users/:id
export async function getUser(id: number): Promise<User> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.getUser(id)
  }
  return http<User>(`/users/${id}`)
}

// POST /api/users : création d'un compte (il n'existe AUCUNE inscription publique, RG10)
export async function createUser(input: CreateUserInput): Promise<User> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.createUser(input)
  }
  return http<User>('/users', { method: 'POST', body: input })
}

// PATCH /api/users/:id : modification (nom, e-mail, rôle, statut, mot de passe)
export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.updateUser(id, input)
  }
  return http<User>(`/users/${id}`, { method: 'PATCH', body: input })
}

// DELETE /api/users/:id
export async function deleteUser(id: number): Promise<void> {
  if (USE_MOCK) {
    const mock = await import('../mocks/users')
    return mock.deleteUser(id)
  }
  await http<void>(`/users/${id}`, { method: 'DELETE' })
}