import type { UserRole } from './index'

export type CommentRole = UserRole | 'VISITOR'

export interface CommentIdentity {
  id?: number
  name: string
  email?: string
  role: CommentRole
  isAgent?: boolean
  agentBadgeLabel?: string | null
}

export interface BlogComment {
  id: number
  article_id: number
  content: string
  created_at: string
  isApproved: boolean
  author: CommentIdentity
}

export interface GuestCommentInput {
  name: string
  email: string
}
