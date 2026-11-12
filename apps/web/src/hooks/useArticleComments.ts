import { useCallback, useEffect, useState } from 'react'
import { listApprovedComments } from '../api/comments'
import { getErrorMessage } from '../lib/http'
import type { BlogComment } from '../types/comments'

export function useArticleComments(articleId: number) {
  const [reloadKey, setReloadKey] = useState(0)
  const [response, setResponse] = useState<{
    key: string
    comments: BlogComment[]
    error: string | null
  }>({ key: '', comments: [], error: null })
  const requestKey = `${articleId}.${reloadKey}`
  const isLoading = response.key !== requestKey
  const comments = isLoading ? [] : response.comments
  const error = isLoading ? null : response.error

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    listApprovedComments(articleId)
      .then((result) => {
        if (!cancelled) setResponse({ key: requestKey, comments: result, error: null })
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setResponse({
            key: requestKey,
            comments: [],
            error: getErrorMessage(loadError),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [articleId, requestKey])

  return { comments, isLoading, error, reload }
}
