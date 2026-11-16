import { http, ApiError } from '../lib/http'
import { USE_MOCK } from '../lib/config'
import type {
  BlogComment,
  CommentIdentity,
  GuestCommentInput,
} from '../types/comments'

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

interface CommentDto {
  id: number
  postId: number
  content: string
  approved?: boolean
  authorType: 'member' | 'visitor'
  name: string
  author: { id: number; name: string; email?: string } | null
  createdAt: string
  updatedAt?: string
  isAgent?: boolean
  agentBadgeLabel?: string | null
}

function toBlogComment(dto: CommentDto, isApproved = dto.approved ?? true): BlogComment {
  return {
    id: dto.id,
    article_id: dto.postId,
    content: dto.content,
    created_at: dto.createdAt,
    isApproved,
    author: {
      id: dto.author?.id,
      name: dto.author?.name ?? dto.name,
      email: dto.author?.email,
      role: dto.authorType === 'member' ? 'ADMIN' : 'VISITOR',
      isAgent: dto.isAgent,
      agentBadgeLabel: dto.agentBadgeLabel,
    },
  }
}

export async function listApprovedComments(articleId: number): Promise<BlogComment[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    return mock.listApprovedComments(articleId)
  }

  const response = await http<ApiEnvelope<CommentDto[]>>(
    `/articles/${articleId}/comments`,
  )
  return response.data.map((comment) => toBlogComment(comment, true))
}

export async function createComment(
  articleId: number,
  content: string,
  identity: CommentIdentity | null,
  guest?: GuestCommentInput,
): Promise<BlogComment> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    return mock.createComment(articleId, content, identity, guest)
  }

  const isMember = identity?.role === 'ADMIN' || identity?.role === 'SUPER_ADMIN'
  if (!isMember && (!guest || !guest.name.trim() || !guest.email.trim())) {
    throw new ApiError('Le nom et l’adresse email sont obligatoires.', 422)
  }

  const response = isMember
    ? await http<ApiEnvelope<CommentDto>>(`/admin/articles/${articleId}/comments`, {
        method: 'POST',
        body: { content },
      })
    : await http<ApiEnvelope<CommentDto>>(`/articles/${articleId}/comments`, {
        method: 'POST',
        body: { ...guest, content },
      })

  return toBlogComment(response.data, response.data.approved ?? isMember)
}

export async function listPendingComments(): Promise<BlogComment[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    return mock.listPendingComments()
  }

  const response = await http<ApiEnvelope<CommentDto[]>>('/admin/comments?approved=false')
  return response.data.map((comment) => toBlogComment(comment, false))
}

export async function approveComment(id: number): Promise<void> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    await mock.approveComment(id)
    return
  }

  await http<ApiEnvelope<CommentDto>>(`/admin/comments/${id}`, {
    method: 'PATCH',
    body: { approved: true },
  })
}
