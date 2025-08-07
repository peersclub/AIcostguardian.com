import { API_BASE_URL, ERROR_MESSAGES } from '@/lib/config/constants'
import { ApiResponse, ApiError } from '@/lib/types/api'

export interface RequestConfig extends RequestInit {
  params?: Record<string, any>
  timeout?: number
  retry?: number
  retryDelay?: number
}

class HttpClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit
  private interceptors: {
    request: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>
    response: Array<(response: Response) => Response | Promise<Response>>
    error: Array<(error: ApiError) => ApiError | Promise<ApiError>>
  }

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    }
  }

  private async handleRequest(url: string, config: RequestConfig = {}): Promise<Response> {
    let finalConfig: RequestConfig = {
      ...config,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
    }

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      finalConfig = await interceptor(finalConfig)
    }

    // Build URL with params
    const finalUrl = this.buildUrl(url, finalConfig.params)

    // Setup timeout
    const controller = new AbortController()
    const timeoutId = finalConfig.timeout
      ? setTimeout(() => controller.abort(), finalConfig.timeout)
      : null

    try {
      let response = await fetch(finalUrl, {
        ...finalConfig,
        signal: controller.signal,
      })

      if (timeoutId) clearTimeout(timeoutId)

      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        response = await interceptor(response)
      }

      // Retry logic
      if (!response.ok && finalConfig.retry && finalConfig.retry > 0) {
        const delay = finalConfig.retryDelay || 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.handleRequest(url, {
          ...config,
          retry: finalConfig.retry - 1,
        })
      }

      return response
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId)

      // Handle timeout error
      if (error.name === 'AbortError') {
        throw this.createError('TIMEOUT', 'Request timeout', 408)
      }

      // Handle network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw this.createError('NETWORK', ERROR_MESSAGES.NETWORK, 0)
      }

      throw error
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
    
    if (!params || Object.keys(params).length === 0) {
      return url
    }

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    return `${url}?${searchParams.toString()}`
  }

  private createError(code: string, message: string, statusCode: number): ApiError {
    return {
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      details: null,
    }
  }

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      let errorData: any = null
      
      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json()
        } catch {
          // Ignore JSON parse error
        }
      }

      const error: ApiError = {
        code: errorData?.code || response.status.toString(),
        message: errorData?.message || response.statusText || ERROR_MESSAGES.GENERIC,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
        details: errorData?.details || null,
      }

      // Apply error interceptors
      let finalError = error
      for (const interceptor of this.interceptors.error) {
        finalError = await interceptor(finalError)
      }

      return {
        success: false,
        error: finalError,
      }
    }

    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return {
        success: true,
        data: data as T,
        metadata: {
          requestId: response.headers.get('x-request-id') || '',
          timestamp: new Date().toISOString(),
          duration: 0,
          version: response.headers.get('x-api-version') || '1.0.0',
        },
      }
    }

    // For non-JSON responses
    const text = await response.text()
    return {
      success: true,
      data: text as any,
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.handleRequest(url, {
      ...config,
      method: 'GET',
    })
    return this.parseResponse<T>(response)
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.handleRequest(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.parseResponse<T>(response)
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.handleRequest(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.parseResponse<T>(response)
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.handleRequest(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.parseResponse<T>(response)
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.handleRequest(url, {
      ...config,
      method: 'DELETE',
    })
    return this.parseResponse<T>(response)
  }

  // Interceptor management
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>) {
    this.interceptors.request.push(interceptor)
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.interceptors.response.push(interceptor)
  }

  addErrorInterceptor(interceptor: (error: ApiError) => ApiError | Promise<ApiError>) {
    this.interceptors.error.push(interceptor)
  }

  // Set auth token
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`,
    }
  }

  // Clear auth token
  clearAuthToken() {
    const headers = { ...this.defaultHeaders }
    delete (headers as any)['Authorization']
    this.defaultHeaders = headers
  }
}

// Create singleton instance
const httpClient = new HttpClient()

// Add request logging in development
if (process.env.NODE_ENV === 'development') {
  httpClient.addRequestInterceptor((config) => {
    console.log(`[HTTP] ${config.method || 'REQUEST'}`, config)
    return config
  })

  httpClient.addResponseInterceptor((response) => {
    console.log(`[HTTP] Response ${response.status}`, response)
    return response
  })
}

export default httpClient
export { HttpClient }