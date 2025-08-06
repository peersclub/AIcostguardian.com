import { useState, useCallback, useEffect, useRef } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface UseAsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useAsync<T = any>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null })

    try {
      const response = await asyncFunction()
      
      if (isMountedRef.current) {
        setState({ data: response, loading: false, error: null })
        onSuccess?.(response)
      }
      
      return response
    } catch (error) {
      const err = error as Error
      
      if (isMountedRef.current) {
        setState({ data: null, loading: false, error: err })
        onError?.(err)
      }
      
      throw err
    }
  }, [asyncFunction, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  }
}