import { http } from '../lib/http'
import { USE_MOCK } from '../lib/config'
import type { Article, Category, ListArticlesParams, Paginated } from '../types'

// GET /api/articles?page=1&limit=3&search=react&category=outils
export async function listArticles(
  params: ListArticlesParams = {},
): Promise<Paginated<Article>> {
  if (USE_MOCK) {
    const mock = await import('../mocks/articles') // chargé seulement en mode test
    return mock.listArticles(params)
  }

  // On construit la partie "?page=1&limit=3..." de l'adresse
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  const qs = query.toString()

  return http<Paginated<Article>>(`/articles${qs ? `?${qs}` : ''}`)
}

// GET /api/categories
export async function listCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/articles')
    return mock.listCategories()
  }
  return http<Category[]>('/categories')
}