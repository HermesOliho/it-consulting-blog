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

  const response = await http<
    Paginated<Article> | { success: boolean; data: Article[] }
  >(`/articles${qs ? `?${qs}` : ''}`)

  if ('total' in response) return response

  return {
    data: response.data,
    total: response.data.length,
    page: params.page ?? 1,
    limit: params.limit ?? response.data.length,
  }
}

// GET /api/articles/:id
export async function getArticleById(id: number): Promise<Article> {
  if (USE_MOCK) {
    const mock = await import('../mocks/articles')
    return mock.getArticleById(id)
  }

  const response = await http<Article | { success: boolean; data: Article }>(
    `/articles/${id}`,
  )

  return 'data' in response ? response.data : response
}

// GET /api/categories
export async function listCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/articles')
    return mock.listCategories()
  }
  return http<Category[]>('/categories')
}