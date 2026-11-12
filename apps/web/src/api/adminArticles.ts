import { http } from '../lib/http'
import { USE_MOCK } from '../lib/config'
import type { Article, ArticleStatus, Paginated } from '../types'
import type { AdminListParams, ArticleInput } from '../types/inputs'

// GET /api/admin/articles?page=1&limit=10&status=DRAFT
// Contrairement à la liste publique, celle-ci contient aussi les BROUILLONS.
export async function listAdminArticles(params: AdminListParams = {}): Promise<Paginated<Article>> {
  if (USE_MOCK) {
    const mock = await import('../mocks/adminArticles')
    return mock.listAdminArticles(params)
  }
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  const qs = query.toString()
  return http<Paginated<Article>>(`/admin/articles${qs ? `?${qs}` : ''}`)
}

// GET /api/admin/articles/:id
export async function getAdminArticle(id: number): Promise<Article> {
  if (USE_MOCK) {
    const mock = await import('../mocks/adminArticles')
    return mock.getAdminArticle(id)
  }
  return http<Article>(`/admin/articles/${id}`)
}

// POST /api/admin/articles : l'auteur est déduit de la session par le serveur
export async function createArticle(input: ArticleInput): Promise<Article> {
  if (USE_MOCK) {
    const mock = await import('../mocks/adminArticles')
    return mock.createArticle(input)
  }
  return http<Article>('/admin/articles', { method: 'POST', body: input })
}

// PUT /api/admin/articles/:id
export async function updateArticle(id: number, input: ArticleInput): Promise<Article> {
  if (USE_MOCK) {
    const mock = await import('../mocks/adminArticles')
    return mock.updateArticle(id, input)
  }
  return http<Article>(`/admin/articles/${id}`, { method: 'PUT', body: input })
}

// PATCH /api/admin/articles/:id/status : publier ou dépublier
export async function setArticleStatus(id: number, status: ArticleStatus): Promise<Article> {
  if (USE_MOCK) {
    const mock = await import('../mocks/adminArticles')
    return mock.setArticleStatus(id, status)
  }
  return http<Article>(`/admin/articles/${id}/status`, { method: 'PATCH', body: { status } })
}

// DELETE /api/admin/articles/:id
export async function deleteArticle(id: number): Promise<void> {
  if (USE_MOCK) {
    const mock = await import('../mocks/adminArticles')
    return mock.deleteArticle(id)
  }
  await http<void>(`/admin/articles/${id}`, { method: 'DELETE' })
}