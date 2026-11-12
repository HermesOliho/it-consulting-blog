// Adresse de base de l'API (définie dans .env.local, sinon "/api")
const API_URL: string = import.meta.env.VITE_API_URL ?? '/api'

// Événement envoyé à toute l'application quand le serveur répond "401 : non connecté"
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

// Erreur personnalisée : porte le code HTTP (404, 401, 500...)
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Extrait un message lisible d'une erreur quelconque (pour l'afficher à l'écran)
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Une erreur est survenue.'
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown // sera converti en JSON automatiquement
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      // "include" envoie les cookies de session (cookie sécurisé géré par le backend :
      // on ne stocke JAMAIS de token dans localStorage)
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    // Serveur éteint, pas d'internet...
    throw new ApiError('Impossible de joindre le serveur. Vérifiez votre connexion.', 0)
  }

  // 204 = succès sans contenu (ex : suppression)
  if (response.status === 204) return undefined as T

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // réponse vide ou qui n'est pas du JSON : on continue
  }

  if (!response.ok) {
    // 401 sur une page protégée = session expirée : on prévient l'application.
    // On ignore les adresses /auth/... : un mauvais mot de passe renvoie aussi 401.
    if (response.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    const message = (body as { message?: string } | null)?.message
    throw new ApiError(message ?? 'Une erreur est survenue.', response.status)
  }

  return body as T
}