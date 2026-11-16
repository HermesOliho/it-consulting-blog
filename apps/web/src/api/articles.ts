import { http } from '../lib/http'
import { USE_MOCK } from '../lib/config'
import type { Article, Category, ListArticlesParams, Paginated } from '../types'
import {
  normalizeArticle,
  normalizeArticlePage,
  type ApiEnvelope,
  type ApiListEnvelope,
  type ArticleDto,
} from './articleDto'

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

  const response = await http<ApiListEnvelope<ArticleDto>>(
    `/articles${qs ? `?${qs}` : ''}`,
  )

  return normalizeArticlePage(response, {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  })
}

// GET /api/articles/:id
export async function getArticleById(id: number): Promise<Article> {
  if (USE_MOCK) {
    const mock = await import('../mocks/articles')
    return mock.getArticleById(id)
  }

  const response = await http<ApiEnvelope<ArticleDto>>(`/articles/${id}`)

  return normalizeArticle(response.data)
}

// GET /api/categories
export async function listCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/articles')
    return mock.listCategories()
  }
  const response = await http<ApiEnvelope<Category[]>>('/categories')
  return response.data
}