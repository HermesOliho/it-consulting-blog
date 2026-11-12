import type { ArticleStatus, UserRole, UserStatus } from './index'

// Création d'un compte administrateur (réservée au SUPER_ADMIN)
export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
}

// Modification d'un compte : tous les champs sont facultatifs
export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string // seulement pour changer le mot de passe
  role?: UserRole
  status?: UserStatus
}

// Filtres de la liste d'articles de l'administration (brouillons inclus)
export interface AdminListParams {
  page?: number
  limit?: number
  status?: ArticleStatus
}

// Contenu envoyé pour créer ou modifier un article.
// L'AUTEUR n'est volontairement pas ici : c'est le serveur qui le déduit de la session.
export interface ArticleInput {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  category_id: number | null
  status: ArticleStatus
}