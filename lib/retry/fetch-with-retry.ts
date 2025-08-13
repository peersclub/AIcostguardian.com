import { withRetry, RETRY_CONFIGS, isRetryableError } from './retry-utils'

export interface FetchWithRetryOptions extends RequestInit {
  retries?: number
  retryDelay?: number
  retryOn?: number[]
  onRetry?: (error: any, attemptNumber: number) => void
}

// Enhanced fetch with automatic retry
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    retryOn = [408, 429, 500, 502, 503, 504],
    onRetry,
    ...fetchOptions
  } = options

  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions)
      
      // Check if response should trigger retry
      if (!response.ok && retryOn.includes(response.status)) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).response = response
        throw error
      }
      
      return response
    },
    {
      retries,
      minTimeout: retryDelay,
      onFailedAttempt: (error) => {
        if (onRetry) {
          onRetry(error, error.attemptNumber)
        }
      },
      shouldRetry: (error) => {
        // Check if it's a retryable HTTP status
        if (error.response && retryOn.includes(error.response.status)) {
          return true
        }
        // Check other retryable errors
        return isRetryableError(error)
      },
    }
  )
}

// Fetch with retry for JSON responses
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// Batch fetch with retry
export async function batchFetchWithRetry(
  urls: string[],
  options: FetchWithRetryOptions = {}
): Promise<Array<{ url: string; success: boolean; data?: any; error?: any }>> {
  const results = await Promise.allSettled(
    urls.map(url => fetchJsonWithRetry(url, options))
  )
  
  return results.map((result, index) => ({
    url: urls[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : undefined,
    error: result.status === 'rejected' ? result.reason : undefined,
  }))
}

// Fetch with timeout and retry
export async function fetchWithTimeout(
  url: string,
  options: FetchWithRetryOptions & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options
  
  return fetchWithRetry(url, {
    ...fetchOptions,
    signal: AbortSignal.timeout(timeout),
  })
}

// Smart fetch that adapts retry strategy based on response
export async function smartFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let retryConfig: any = { ...RETRY_CONFIGS.api }
  let lastError: any
  
  // First attempt to understand the service behavior
  try {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) })
    if (response.ok) return response
    
    // Adapt retry strategy based on response
    if (response.status === 429) {
      // Rate limited - use longer delays
      retryConfig = {
        retries: 3,
        minTimeout: 5000,
        maxTimeout: 30000,
        factor: 2,
        randomize: true,
      }
      
      // Check for Retry-After header
      const retryAfter = response.headers.get('Retry-After')
      if (retryAfter) {
        const delay = parseInt(retryAfter) * 1000
        retryConfig.minTimeout = delay
      }
    } else if (response.status >= 500) {
      // Server error - use standard retry
      retryConfig = { ...RETRY_CONFIGS.api }
    }
    
    lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
    ;(lastError as any).response = response
  } catch (error) {
    lastError = error
    
    // Network error - use aggressive retry
    if (isRetryableError(error)) {
      retryConfig = {
        retries: 5,
        minTimeout: 500,
        maxTimeout: 5000,
        factor: 1.5,
        randomize: true,
      }
    }
  }
  
  // Retry with adapted configuration
  return withRetry(
    async () => {
      const response = await fetch(url, options)
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).response = response
        throw error
      }
      return response
    },
    retryConfig
  )
}

// Create a fetch client with default retry configuration
export function createRetryClient(defaultOptions: FetchWithRetryOptions = {}) {
  return {
    get: (url: string, options?: FetchWithRetryOptions) =>
      fetchWithRetry(url, { ...defaultOptions, ...options, method: 'GET' }),
    
    post: (url: string, body?: any, options?: FetchWithRetryOptions) =>
      fetchWithRetry(url, {
        ...defaultOptions,
        ...options,
        method: 'POST',
        body: typeof body === 'string' ? body : JSON.stringify(body),
      }),
    
    put: (url: string, body?: any, options?: FetchWithRetryOptions) =>
      fetchWithRetry(url, {
        ...defaultOptions,
        ...options,
        method: 'PUT',
        body: typeof body === 'string' ? body : JSON.stringify(body),
      }),
    
    delete: (url: string, options?: FetchWithRetryOptions) =>
      fetchWithRetry(url, { ...defaultOptions, ...options, method: 'DELETE' }),
    
    json: <T = any>(url: string, options?: FetchWithRetryOptions) =>
      fetchJsonWithRetry<T>(url, { ...defaultOptions, ...options }),
  }
}