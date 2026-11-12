// ============================================================
// Types partagés : ils reflètent le modèle de données du
// cahier des charges (USERS, ARTICLES, CATEGORIES).
// ============================================================

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' // brouillon | publié
export type UserRole = 'SUPER_ADMIN' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  status: ArticleStatus
  author: { id: number; name: string } // le backend renvoie le nom de l'auteur
  category: Category | null
  published_at: string | null // date ISO, ex : "2026-11-10T09:00:00Z"
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
}

// Réponse d'une liste paginée (articles, commentaires...)
export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Filtres possibles pour la liste d'articles
export interface ListArticlesParams {
  page?: number
  limit?: number
  search?: string
  category?: string // slug de la catégorie
}