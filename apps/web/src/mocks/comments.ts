import type { BlogComment, CommentIdentity } from '../types/comments'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

const comments: BlogComment[] = [
  {
    id: 1,
    article_id: 1,
    content: 'Merci pour cette explication, les exemples sont très utiles.',
    created_at: '2026-11-11T10:00:00Z',
    isApproved: true,
    author: {
      id: 201,
      name: 'Nadia',
      role: 'VISITOR',
      isAgent: true,
      agentBadgeLabel: 'Agent terrain',
    },
  },
  {
    id: 2,
    article_id: 1,
    content: 'Question en attente de validation.',
    created_at: '2026-11-11T11:00:00Z',
    isApproved: false,
    author: {
      id: 202,
      name: 'Marc',
      role: 'VISITOR',
      isAgent: false,
    },
  },
]

let nextCommentId = 3

export async function listApprovedComments(articleId: number): Promise<BlogComment[]> {
  await delay()
  return comments.filter((comment) => comment.article_id === articleId && comment.isApproved)
}

export async function createComment(
  articleId: number,
  content: string,
  author: CommentIdentity,
): Promise<BlogComment> {
  await delay()
  const comment: BlogComment = {
    id: nextCommentId++,
    article_id: articleId,
    content,
    created_at: new Date().toISOString(),
    isApproved: author.role !== 'VISITOR',
    author,
  }
  comments.push(comment)
  return comment
}

export async function listPendingComments(): Promise<BlogComment[]> {
  await delay()
  return comments.filter((comment) => !comment.isApproved)
}

export async function approveComment(id: number): Promise<BlogComment> {
  await delay()
  const comment = comments.find((item) => item.id === id)
  if (!comment) throw new Error('Commentaire introuvable.')
  comment.isApproved = true
  return comment
}
