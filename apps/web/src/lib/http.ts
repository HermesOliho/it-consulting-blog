// Adresse de base de l'API (définie dans .env.local, sinon "/api")
const API_URL: string = import.meta.env.VITE_API_URL ?? '/api'

// Erreur personnalisée : porte le code HTTP (404, 401, 500...)
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
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
      // "include" envoie les cookies de session (le cahier des charges demande
      // des cookies sécurisés : on ne stocke JAMAIS de token dans localStorage)
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
    const message = (body as { message?: string } | null)?.message
    throw new ApiError(message ?? 'Une erreur est survenue.', response.status)
  }

  return body as T
}