import { useCallback, useEffect, useState } from 'react'
import { listPendingComments } from '../api/comments'
import { getErrorMessage } from '../lib/http'
import type { BlogComment } from '../types/comments'

export function usePendingComments() {
  const [reloadKey, setReloadKey] = useState(0)
  const [response, setResponse] = useState<{
    key: number
    comments: BlogComment[]
    error: string | null
  }>({ key: -1, comments: [], error: null })
  const isLoading = response.key !== reloadKey
  const comments = isLoading ? [] : response.comments
  const error = isLoading ? null : response.error

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    listPendingComments()
      .then((result) => {
        if (!cancelled) {
          setResponse({
            key: reloadKey,
            comments: result.filter((comment) => !comment.isApproved),
            error: null,
          })
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setResponse({
            key: reloadKey,
            comments: [],
            error: getErrorMessage(loadError),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return { comments, isLoading, error, reload }
}
