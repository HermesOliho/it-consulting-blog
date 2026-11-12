import { ApiError, UNAUTHORIZED_EVENT } from '../lib/http'
import type { User } from '../types'
import type { CreateUserInput, UpdateUserInput } from '../types/inputs'

// FAUX COMPTES : uniquement pour le développement, sans backend.
// En vrai, le serveur ne stocke JAMAIS un mot de passe en clair (règle RG09 : haché).

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

interface MockAccount extends User {
  password: string
}

const accounts: MockAccount[] = [
  {
    id: 1,
    name: 'Amina Kabeya',
    email: 'super@exemple.test',
    password: 'MotDePasse-Test-1',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    created_at: '2026-10-01T09:00:00Z',
  },
  {
    id: 2,
    name: 'Joseph Mbuyi',
    email: 'admin@exemple.test',
    password: 'MotDePasse-Test-2',
    role: 'ADMIN',
    status: 'ACTIVE',
    created_at: '2026-10-05T09:00:00Z',
  },
  {
    id: 3,
    name: 'Grace Lunda',
    email: 'grace@exemple.test',
    password: 'MotDePasse-Test-3',
    role: 'ADMIN',
    status: 'INACTIVE', // compte désactivé : la connexion doit être refusée
    created_at: '2026-10-10T09:00:00Z',
  },
]

// Ne renvoie jamais le mot de passe à l'écran
function toUser(account: MockAccount): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    status: account.status,
    created_at: account.created_at,
  }
}

// ----- Session simulée (sessionStorage = effacée à la fermeture de l'onglet) -----
const SESSION_KEY = 'mock-session-user-id'

function readSession(): number | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function writeSession(id: number | null): void {
  try {
    if (id === null) sessionStorage.removeItem(SESSION_KEY)
    else sessionStorage.setItem(SESSION_KEY, String(id))
  } catch {
    // stockage indisponible : on ignore
  }
}

let sessionUserId: number | null = readSession()

function sessionAccount(): MockAccount | null {
  const account = accounts.find((a) => a.id === sessionUserId)
  return account && account.status === 'ACTIVE' ? account : null
}

// Utilisé aussi par mocks/adminArticles.ts : exige d'être connecté
export function requireSession(): User {
  const account = sessionAccount()
  if (!account) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401)
  }
  return toUser(account)
}

// Exige d'être connecté ET super administrateur (sinon erreur 403)
function requireSuperAdmin(): User {
  const user = requireSession()
  if (user.role !== 'SUPER_ADMIN') {
    throw new ApiError('Action réservée au super administrateur.', 403)
  }
  return user
}

// ----- Authentification -----

// Limitation des tentatives de connexion (exigence de sécurité du cahier des charges)
const failedAttempts = new Map<string, number>()
const MAX_ATTEMPTS = 5

export async function login(email: string, password: string): Promise<User> {
  await delay(400)
  const key = email.trim().toLowerCase()

  if ((failedAttempts.get(key) ?? 0) >= MAX_ATTEMPTS) {
    throw new ApiError('Trop de tentatives. Réessayez dans quelques minutes.', 429)
  }

  const account = accounts.find((a) => a.email === key)
  // Même message pour "compte inconnu", "mauvais mot de passe" et "compte désactivé" :
  // on ne révèle pas si une adresse e-mail existe.
  if (!account || account.password !== password || account.status !== 'ACTIVE') {
    failedAttempts.set(key, (failedAttempts.get(key) ?? 0) + 1)
    throw new ApiError('Identifiants incorrects.', 401)
  }

  failedAttempts.delete(key)
  sessionUserId = account.id
  writeSession(account.id)
  return toUser(account)
}

export async function logout(): Promise<void> {
  await delay(150)
  sessionUserId = null
  writeSession(null)
}

export async function currentUser(): Promise<User | null> {
  await delay(150)
  const account = sessionAccount()
  return account ? toUser(account) : null
}

// ----- Gestion des utilisateurs (étape 4) : réservée au SUPER_ADMIN -----

export async function listUsers(): Promise<User[]> {
  await delay()
  requireSuperAdmin()
  return accounts.map(toUser)
}

export async function getUser(id: number): Promise<User> {
  await delay(200)
  requireSuperAdmin()
  const account = accounts.find((a) => a.id === id)
  if (!account) throw new ApiError('Utilisateur introuvable.', 404)
  return toUser(account)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  await delay()
  requireSuperAdmin()
  const email = input.email.trim().toLowerCase()

  if (accounts.some((a) => a.email === email)) {
    throw new ApiError('Cette adresse e-mail est déjà utilisée.', 409)
  }

  const account: MockAccount = {
    id: Math.max(0, ...accounts.map((a) => a.id)) + 1,
    name: input.name.trim(),
    email,
    password: input.password,
    role: input.role,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  }
  accounts.push(account)
  return toUser(account)
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
  await delay()
  const me = requireSuperAdmin()
  const account = accounts.find((a) => a.id === id)
  if (!account) throw new ApiError('Utilisateur introuvable.', 404)

  const newRole = input.role ?? account.role
  const newStatus = input.status ?? account.status
  const newEmail = input.email?.trim().toLowerCase() ?? account.email

  // On ne peut pas se retirer ses propres droits ni se désactiver
  // (cela garantit qu'il reste toujours au moins un super administrateur actif)
  if (id === me.id && (newRole !== 'SUPER_ADMIN' || newStatus !== 'ACTIVE')) {
    throw new ApiError('Vous ne pouvez pas modifier votre propre rôle ou statut.', 403)
  }
  if (accounts.some((a) => a.id !== id && a.email === newEmail)) {
    throw new ApiError('Cette adresse e-mail est déjà utilisée.', 409)
  }

  account.name = input.name?.trim() ?? account.name
  account.email = newEmail
  account.role = newRole
  account.status = newStatus
  if (input.password) account.password = input.password
  return toUser(account)
}

export async function deleteUser(id: number): Promise<void> {
  await delay()
  const me = requireSuperAdmin()
  if (id === me.id) {
    throw new ApiError('Vous ne pouvez pas supprimer votre propre compte.', 403)
  }
  const index = accounts.findIndex((a) => a.id === id)
  if (index === -1) throw new ApiError('Utilisateur introuvable.', 404)
  accounts.splice(index, 1)
}