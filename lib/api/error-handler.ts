import { NextResponse } from 'next/server';

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  details?: any;
  code?: string;
  timestamp?: string;
  requestId?: string;
}

// Custom error classes
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter?: number) {
    super('Too many requests', 429, 'RATE_LIMIT')
    this.name = 'RateLimitError'
    if (retryAfter) {
      this.details = { retryAfter }
    }
  }
}

/**
 * Wraps an API handler with error handling to ensure JSON responses
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      // Always return JSON for API errors
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        } as ApiError,
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }) as T;
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      details
    } as ApiError,
    { 
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    data,
    { 
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Validates request body and returns typed data
 */
export async function validateRequestBody<T extends Record<string, any>>(
  request: Request,
  required: (keyof T)[]
): Promise<T> {
  let body: T;
  
  try {
    const text = await request.text();
    if (!text) {
      throw new Error('Request body is empty');
    }
    body = JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  for (const field of required) {
    if (!(field in body)) {
      throw new Error(`Missing required field: ${String(field)}`);
    }
  }
  
  return body;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * Handle API errors with proper status codes
 */
export function handleAPIError(error: any, requestId?: string): NextResponse {
  console.error('API Error:', error)
  
  const timestamp = new Date().toISOString()
  
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp,
        requestId,
      } as ApiError,
      { status: error.statusCode }
    )
  }
  
  // Default error
  const isDevelopment = process.env.NODE_ENV === 'development'
  return NextResponse.json(
    {
      error: isDevelopment ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      details: isDevelopment ? error.stack : undefined,
      timestamp,
      requestId,
    } as ApiError,
    { status: 500 }
  )
}

/**
 * Safe async operation with error recovery
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T | (() => T),
  onError?: (error: any) => void
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (onError) {
      onError(error)
    }
    
    console.error('Safe async operation failed:', error)
    
    if (fallback !== undefined) {
      return typeof fallback === 'function' ? (fallback as () => T)() : fallback
    }
    
    throw error
  }
}