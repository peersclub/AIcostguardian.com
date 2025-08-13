import pRetry, { AbortError } from 'p-retry'
import { backOff } from 'exponential-backoff'

// Retry configuration types
export interface RetryConfig {
  retries?: number
  minTimeout?: number
  maxTimeout?: number
  factor?: number
  randomize?: boolean
  onFailedAttempt?: (error: any) => void
  shouldRetry?: (error: any) => boolean
}

// Default configurations for different scenarios
export const RETRY_CONFIGS = {
  // For API calls to external services
  api: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 10000,
    factor: 2,
    randomize: true,
  },
  
  // For database operations
  database: {
    retries: 5,
    minTimeout: 100,
    maxTimeout: 3000,
    factor: 1.5,
    randomize: false,
  },
  
  // For file operations
  file: {
    retries: 2,
    minTimeout: 500,
    maxTimeout: 2000,
    factor: 2,
    randomize: false,
  },
  
  // For AI provider calls
  ai: {
    retries: 3,
    minTimeout: 2000,
    maxTimeout: 30000,
    factor: 2,
    randomize: true,
  },
  
  // For critical operations
  critical: {
    retries: 5,
    minTimeout: 1000,
    maxTimeout: 15000,
    factor: 1.8,
    randomize: true,
  },
} as const

// Error types that should trigger retry
const RETRYABLE_ERRORS = [
  'ECONNRESET',
  'ENOTFOUND',
  'ESOCKETTIMEDOUT',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'EPIPE',
  'EAI_AGAIN',
]

// HTTP status codes that should trigger retry
const RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
  509, // Bandwidth Limit Exceeded
]

// Check if an error is retryable
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code && RETRYABLE_ERRORS.includes(error.code)) {
    return true
  }
  
  // HTTP errors
  if (error.response?.status && RETRYABLE_STATUS_CODES.includes(error.response.status)) {
    return true
  }
  
  // Rate limit errors
  if (error.response?.status === 429) {
    return true
  }
  
  // Timeout errors
  if (error.message?.toLowerCase().includes('timeout')) {
    return true
  }
  
  // Connection errors
  if (error.message?.toLowerCase().includes('network') || 
      error.message?.toLowerCase().includes('connection')) {
    return true
  }
  
  return false
}

// Generic retry wrapper using p-retry
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = RETRY_CONFIGS.api
): Promise<T> {
  return pRetry(fn, {
    retries: config.retries || 3,
    minTimeout: config.minTimeout || 1000,
    maxTimeout: config.maxTimeout || 10000,
    factor: config.factor || 2,
    randomize: config.randomize ?? true,
    onFailedAttempt: (error) => {
      console.log(
        `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
      )
      
      if (config.onFailedAttempt) {
        config.onFailedAttempt(error)
      }
      
      // Don't retry if it's not a retryable error
      if (config.shouldRetry && !config.shouldRetry(error)) {
        throw new AbortError(error.message)
      }
      
      if (!isRetryableError(error)) {
        throw new AbortError(error.message)
      }
    },
  })
}

// Retry with exponential backoff
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    numOfAttempts?: number
    startingDelay?: number
    timeMultiple?: number
    maxDelay?: number
    jitter?: 'none' | 'full'
    retry?: (error: any, attemptNumber: number) => boolean
  }
): Promise<T> {
  return backOff(fn, {
    numOfAttempts: options?.numOfAttempts || 3,
    startingDelay: options?.startingDelay || 1000,
    timeMultiple: options?.timeMultiple || 2,
    maxDelay: options?.maxDelay || 30000,
    jitter: options?.jitter || 'full',
    retry: options?.retry || ((error) => isRetryableError(error)),
  })
}

// Circuit breaker implementation
export class CircuitBreaker {
  private failures = 0
  private successCount = 0
  private lastFailureTime?: Date
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000, // 1 minute
    private readonly successThreshold: number = 2
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be opened
    if (this.state === 'OPEN') {
      const now = new Date()
      if (
        this.lastFailureTime &&
        now.getTime() - this.lastFailureTime.getTime() > this.timeout
      ) {
        this.state = 'HALF_OPEN'
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess() {
    this.failures = 0
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED'
      }
    }
  }
  
  private onFailure() {
    this.failures++
    this.lastFailureTime = new Date()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN'
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    }
  }
}

// Retry with circuit breaker
const circuitBreakers = new Map<string, CircuitBreaker>()

export async function withCircuitBreaker<T>(
  key: string,
  fn: () => Promise<T>,
  options?: {
    threshold?: number
    timeout?: number
    successThreshold?: number
  }
): Promise<T> {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(
      key,
      new CircuitBreaker(
        options?.threshold,
        options?.timeout,
        options?.successThreshold
      )
    )
  }
  
  const breaker = circuitBreakers.get(key)!
  return breaker.execute(fn)
}

// Batch retry for multiple operations
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  config: RetryConfig = RETRY_CONFIGS.api
): Promise<Array<{ success: boolean; result?: T; error?: any }>> {
  const results = await Promise.allSettled(
    operations.map(op => withRetry(op, config))
  )
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, result: result.value }
    } else {
      return { success: false, error: result.reason }
    }
  })
}

// Retry with custom delay
export async function retryWithDelay<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number | ((attempt: number) => number) = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt < attempts) {
        const waitTime = typeof delay === 'function' ? delay(attempt) : delay
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError
}

// Intelligent retry based on error type
export async function intelligentRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number
    onError?: (error: any, attempt: number) => void
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts || 3
  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      if (options?.onError) {
        options.onError(error, attempt)
      }
      
      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        throw error
      }
      
      // Calculate delay based on error type
      let delay = 1000 * attempt // Default exponential
      
      // Rate limit error - use retry-after header if available
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after']
        if (retryAfter) {
          delay = parseInt(retryAfter) * 1000
        } else {
          delay = 5000 * attempt // Longer delay for rate limits
        }
      }
      
      // Network error - shorter initial delay
      if (error.code && RETRYABLE_ERRORS.includes(error.code)) {
        delay = 500 * Math.pow(2, attempt - 1)
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}