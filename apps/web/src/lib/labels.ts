import type { ArticleStatus, UserRole, UserStatus } from '../types'

// Textes affichés à l'écran pour les valeurs techniques de la base de données
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Actif',
  INACTIVE: 'Désactivé',
}

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
}