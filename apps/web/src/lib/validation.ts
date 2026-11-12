// Validation côté navigateur : c'est un CONFORT pour l'utilisateur.
// Le serveur revalide toujours tout (règle RG12).

// Format d'e-mail simple (règle RG04)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value)
}

export const PASSWORD_MIN_LENGTH = 10

export function isValidPassword(value: string): boolean {
  return value.length >= PASSWORD_MIN_LENGTH && value.length <= 128
}

// Accepte seulement les adresses http(s) : refuse "javascript:", "data:", etc.
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

// "Sécuriser son application !" → "securiser-son-application"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // enlève les accents
    .replace(/[^a-z0-9]+/g, '-') // tout ce qui n'est pas lettre/chiffre devient "-"
    .replace(/^-+|-+$/g, '') // pas de "-" au début ni à la fin
    .slice(0, 80)
}