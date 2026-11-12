import { ApiError } from '../lib/http'
import type { Article, ArticleStatus, Paginated } from '../types'
import type { AdminListParams, ArticleInput } from '../types/inputs'
import { articles, categories } from './db'
import { requireSession } from './users'

// FAUSSES DONNÉES : uniquement pour le développement, sans backend.

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function indexOfArticle(id: number): number {
  const index = articles.findIndex((a) => a.id === id)
  if (index === -1) throw new ApiError('Article introuvable.', 404)
  return index
}

// Vérifie qu'un autre article n'utilise pas déjà ce "slug" (adresse unique)
function assertSlugFree(slug: string, ignoreId?: number): void {
  if (articles.some((a) => a.slug === slug && a.id !== ignoreId)) {
    throw new ApiError('Cette adresse (slug) est déjà utilisée par un autre article.', 409)
  }
}

export async function listAdminArticles(params: AdminListParams): Promise<Paginated<Article>> {
  await delay()
  requireSession()

  const page = params.page ?? 1
  const limit = params.limit ?? 10

  const filtered = articles
    .filter((a) => !params.status || a.status === params.status) // brouillons INCLUS
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at)) // modifiés récemment d'abord

  return {
    data: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    limit,
  }
}

export async function getAdminArticle(id: number): Promise<Article> {
  await delay(200)
  requireSession()
  return { ...articles[indexOfArticle(id)] }
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  await delay()
  const user = requireSession()
  assertSlugFree(input.slug)

  const now = new Date().toISOString()
  const article: Article = {
    id: Math.max(0, ...articles.map((a) => a.id)) + 1,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    cover_image: input.cover_image,
    status: input.status,
    author: { id: user.id, name: user.name }, // l'auteur vient de la SESSION, pas du formulaire
    category: categories.find((c) => c.id === input.category_id) ?? null,
    published_at: input.status === 'PUBLISHED' ? now : null,
    created_at: now,
    updated_at: now,
  }
  articles.push(article)
  return { ...article }
}

export async function updateArticle(id: number, input: ArticleInput): Promise<Article> {
  await delay()
  requireSession()
  const index = indexOfArticle(id)
  assertSlugFree(input.slug, id)

  const current = articles[index]
  const now = new Date().toISOString()
  const updated: Article = {
    ...current,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    cover_image: input.cover_image,
    category: categories.find((c) => c.id === input.category_id) ?? null,
    status: input.status,
    // la date de publication est conservée, ou créée à la première publication
    published_at: input.status === 'PUBLISHED' ? (current.published_at ?? now) : null,
    updated_at: now,
  }
  articles[index] = updated
  return { ...updated }
}

export async function setArticleStatus(id: number, status: ArticleStatus): Promise<Article> {
  await delay()
  requireSession()
  const index = indexOfArticle(id)

  const current = articles[index]
  const now = new Date().toISOString()
  const updated: Article = {
    ...current,
    status,
    published_at: status === 'PUBLISHED' ? (current.published_at ?? now) : null,
    updated_at: now,
  }
  articles[index] = updated
  return { ...updated }
}

export async function deleteArticle(id: number): Promise<void> {
  await delay()
  requireSession()
  articles.splice(indexOfArticle(id), 1)
}