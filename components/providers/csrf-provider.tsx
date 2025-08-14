'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CSRFContextType {
  token: string | null
  loading: boolean
  error: string | null
  refreshToken: () => Promise<void>
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  loading: true,
  error: null,
  refreshToken: async () => {},
})

export function useCSRFToken() {
  return useContext(CSRFContext)
}

interface CSRFProviderProps {
  children: ReactNode
}

export function CSRFProvider({ children }: CSRFProviderProps) {
  const { status } = useSession()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchToken = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/csrf', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, CSRF not needed
          setToken(null)
          return
        }
        throw new Error(`Failed to fetch CSRF token: ${response.status}`)
      }
      
      const data = await response.json()
      setToken(data.token)
      
      // Store in sessionStorage for quick access
      if (typeof window !== 'undefined' && data.token) {
        sessionStorage.setItem('csrf-token', data.token)
      }
    } catch (err) {
      console.error('CSRF token fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch CSRF token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch token if user is authenticated
    if (status === 'authenticated') {
      // Check sessionStorage first
      const storedToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrf-token') : null
      if (storedToken) {
        setToken(storedToken)
        setLoading(false)
      } else {
        fetchToken()
      }
    } else if (status === 'unauthenticated') {
      setToken(null)
      setLoading(false)
    }
  }, [status])

  // Refresh token every 30 minutes
  useEffect(() => {
    if (status === 'authenticated' && token) {
      const interval = setInterval(() => {
        fetchToken()
      }, 30 * 60 * 1000) // 30 minutes

      return () => clearInterval(interval)
    }
  }, [status, token])

  const refreshToken = async () => {
    await fetchToken()
  }

  return (
    <CSRFContext.Provider value={{ token, loading, error, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  )
}

// Utility function to add CSRF token to fetch requests
export function withCSRF(url: string, options: RequestInit = {}): RequestInit {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('csrf-token') : null
  
  if (!token || ['GET', 'HEAD'].includes(options.method?.toUpperCase() || 'GET')) {
    return options
  }

  const headers = new Headers(options.headers)
  headers.set('x-csrf-token', token)

  return {
    ...options,
    headers,
    credentials: 'include',
  }
}