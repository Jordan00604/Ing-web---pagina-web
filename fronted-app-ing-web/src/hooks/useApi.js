import { useEffect, useState } from 'react'
import { api } from '../services/api'

export function useApi(path, token, revision = 0) {
  const [state, setState] = useState({ key: null, data: null, error: null, loading: true })
  const key = `${path}:${revision}:${token || ''}`
  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    api(path, { token, signal: controller.signal }).then(
      data => setState({ key, data, error: null, loading: false }),
      error => { if (error.name !== 'AbortError') setState({ key, data: null, error, loading: false }) },
    )
    return () => controller.abort()
  }, [path, token, revision, key])
  return state.key === key ? state : { data: null, error: null, loading: Boolean(path) }
}
