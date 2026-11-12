import { http } from '../lib/http'
import { USE_MOCK } from '../lib/config'
import type { BlogComment, CommentIdentity } from '../types/comments'

type ApiList<T> = T[] | { success: boolean; data: T[] }
type ApiItem<T extends object> = T | { success: boolean; data: T }

function unwrapList<T>(response: ApiList<T>): T[] {
  return Array.isArray(response) ? response : response.data
}

function unwrapItem<T extends object>(response: ApiItem<T>): T {
  return 'data' in response ? response.data : response
}

export async function listApprovedComments(articleId: number): Promise<BlogComment[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    return mock.listApprovedComments(articleId)
  }
  const response = await http<ApiList<BlogComment>>(`/articles/${articleId}/comments`)
  return unwrapList(response).filter((comment) => comment.isApproved)
}

export async function createComment(
  articleId: number,
  content: string,
  identity: CommentIdentity,
): Promise<BlogComment> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    return mock.createComment(articleId, content, identity)
  }
  const response = await http<ApiItem<BlogComment>>(`/articles/${articleId}/comments`, {
    method: 'POST',
    body: { content },
  })
  return unwrapItem(response)
}

export async function listPendingComments(): Promise<BlogComment[]> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    return mock.listPendingComments()
  }
  const response = await http<ApiList<BlogComment>>('/admin/comments?status=pending')
  return unwrapList(response).filter((comment) => !comment.isApproved)
}

export async function approveComment(id: number): Promise<void> {
  if (USE_MOCK) {
    const mock = await import('../mocks/comments')
    await mock.approveComment(id)
    return
  }
  await http<void>(`/admin/comments/${id}/approval`, {
    method: 'PATCH',
    body: { isApproved: true },
  })
}
