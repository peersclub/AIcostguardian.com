'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface CSRFContextType {
  token: string | null
  header: string
  getHeaders: () => HeadersInit
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  header: 'x-csrf-token',
  getHeaders: () => ({}),
})

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const { status } = useSession()
  const header = 'x-csrf-token'

  useEffect(() => {
    // Only fetch CSRF token if user is authenticated
    if (status === 'authenticated') {
      // Get CSRF token from meta tag or fetch it
      const metaTag = document.querySelector('meta[name="csrf-token"]')
      const metaToken = metaTag?.getAttribute('content')
      
      if (metaToken) {
        setToken(metaToken)
      } else {
        // Fetch a new token if not present
        fetch('/api/csrf', { credentials: 'include' })
          .then(res => {
            if (!res.ok) {
              // If not authenticated or error, don't throw
              if (res.status === 401) {
                console.log('User not authenticated, CSRF token not required')
                return null
              }
              throw new Error(`Failed to fetch CSRF token: ${res.status}`)
            }
            return res.json()
          })
          .then(data => {
            if (data?.token) {
              setToken(data.token)
              // Add meta tag for future use
              const meta = document.createElement('meta')
              meta.name = 'csrf-token'
              meta.content = data.token
              document.head.appendChild(meta)
              // Also store in sessionStorage
              sessionStorage.setItem('csrf-token', data.token)
            }
          })
          .catch(err => {
            console.error('CSRF token fetch error:', err)
          })
      }
    } else if (status === 'unauthenticated') {
      setToken(null)
      // Clear stored token
      const metaTag = document.querySelector('meta[name="csrf-token"]')
      if (metaTag) {
        metaTag.remove()
      }
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('csrf-token')
      }
    }
  }, [status])

  const getHeaders = (): HeadersInit => {
    if (!token) return {}
    return {
      [header]: token,
    }
  }

  return (
    <CSRFContext.Provider value={{ token, header, getHeaders }}>
      {children}
    </CSRFContext.Provider>
  )
}

export function useCSRF() {
  const context = useContext(CSRFContext)
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider')
  }
  return context
}

// Helper function to add CSRF token to fetch requests
export function fetchWithCSRF(url: string, options: RequestInit = {}) {
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  const token = metaTag?.getAttribute('content')
  
  if (token) {
    options.headers = {
      ...options.headers,
      'x-csrf-token': token,
    }
  }
  
  return fetch(url, options)
}