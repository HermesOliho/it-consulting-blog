import type { Article, ArticleStatus, Category, Paginated } from '../types'

export interface ArticleDto {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  cover_image: string | null
  status: ArticleStatus
  publishedAt: string | null
  published_at: string | null
  authorId: number
  author: { id: number; name: string } | null
  category: Category | null
  createdAt: string
  created_at: string
  updatedAt: string
  updated_at: string
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export interface ApiPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiListEnvelope<T> extends ApiEnvelope<T[]> {
  meta?: ApiPagination
}

export function normalizeArticle(dto: ArticleDto): Article {
  if (!dto.author) {
    throw new Error(`L’article « ${dto.title} » ne contient pas d’auteur.`)
  }

  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    excerpt: dto.excerpt ?? '',
    content: dto.content,
    cover_image: dto.cover_image ?? dto.coverImage,
    status: dto.status,
    author: dto.author,
    category: dto.category,
    published_at: dto.published_at ?? dto.publishedAt,
    created_at: dto.created_at ?? dto.createdAt,
    updated_at: dto.updated_at ?? dto.updatedAt,
  }
}

export function normalizeArticlePage(
  response: ApiListEnvelope<ArticleDto>,
  fallback: Pick<Paginated<Article>, 'page' | 'limit'>,
): Paginated<Article> {
  return {
    data: response.data.map(normalizeArticle),
    total: response.meta?.total ?? response.data.length,
    page: response.meta?.page ?? fallback.page,
    limit: response.meta?.limit ?? fallback.limit,
  }
}
