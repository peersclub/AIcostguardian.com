'use client'

import { useEffect, useState } from 'react'

let csrfToken: string | null = null
let tokenPromise: Promise<string | null> | null = null

export async function fetchCSRFToken(): Promise<string | null> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken
  }

  // Return existing promise if token is being fetched
  if (tokenPromise) {
    return tokenPromise
  }

  // Fetch new token
  tokenPromise = fetch('/api/csrf', {
    credentials: 'include',
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch CSRF token')
      }
      return res.json()
    })
    .then(data => {
      csrfToken = data.token
      return csrfToken
    })
    .catch(error => {
      console.error('Failed to fetch CSRF token:', error)
      tokenPromise = null
      return null
    })

  return tokenPromise
}

export function useCSRF() {
  const [token, setToken] = useState<string | null>(csrfToken)
  const [loading, setLoading] = useState(!csrfToken)

  useEffect(() => {
    if (!csrfToken) {
      fetchCSRFToken().then(newToken => {
        setToken(newToken)
        setLoading(false)
      })
    }
  }, [])

  return { token, loading }
}

// Helper to add CSRF token to fetch requests
export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
  const token = await fetchCSRFToken()
  
  const headers = new Headers(options.headers)
  if (token && !['GET', 'HEAD'].includes(options.method?.toUpperCase() || 'GET')) {
    headers.set('x-csrf-token', token)
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

// Helper to get headers with CSRF token
export async function getCSRFHeaders(): Promise<HeadersInit> {
  const token = await fetchCSRFToken()
  return token ? { 'x-csrf-token': token } : {}
}