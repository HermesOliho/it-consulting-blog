import { FiAward, FiShield, FiUser } from 'react-icons/fi'
import type { CommentIdentity } from '../../types/comments'

interface UserBadgeProps {
  user: Pick<CommentIdentity, 'role' | 'isAgent' | 'agentBadgeLabel'>
}

export default function UserBadge({ user }: UserBadgeProps) {
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return (
      <span className="comment-badge comment-badge--admin">
        <FiShield aria-hidden="true" /> Admin
      </span>
    )
  }

  if (user.isAgent) {
    return (
      <span className="comment-badge comment-badge--agent">
        <FiAward aria-hidden="true" /> {user.agentBadgeLabel?.trim() || 'Agent'}
      </span>
    )
  }

  return (
    <span className="comment-badge comment-badge--visitor">
      <FiUser aria-hidden="true" /> Visiteur
    </span>
  )
}
