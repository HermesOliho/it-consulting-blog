import type { Article, Category, ListArticlesParams, Paginated } from '../types'
import { articles, categories } from './db'

// Petite pause : simule le temps de réponse d'un vrai serveur
// (permet de voir les messages "Chargement...")
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listArticles(params: ListArticlesParams): Promise<Paginated<Article>> {
  await delay()

  const page = params.page ?? 1
  const limit = params.limit ?? 9
  const term = params.search?.trim().toLowerCase()

  const filtered = articles
    .filter((a) => a.status === 'PUBLISHED') // le public ne voit que les articles publiés
    .filter((a) => !params.category || a.category?.slug === params.category)
    .filter((a) => !term || `${a.title} ${a.excerpt} ${a.content}`.toLowerCase().includes(term))
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? '')) // plus récents d'abord

  return {
    data: filtered.slice((page - 1) * limit, page * limit), // pagination
    total: filtered.length,
    page,
    limit,
  }
}

export async function listCategories(): Promise<Category[]> {
  await delay(150)
  return categories
}