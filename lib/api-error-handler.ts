import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: any
}

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiException'
  }
}

/**
 * Centralized API error handler
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error)

  // Handle known error types
  if (error instanceof ApiException) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'ValidationError',
        message: 'Invalid request data',
        statusCode: 400,
        details: error.errors,
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'ConflictError',
            message: 'A record with this value already exists',
            statusCode: 409,
            details: { field: error.meta?.target },
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: 'NotFoundError',
            message: 'Record not found',
            statusCode: 404,
          },
          { status: 404 }
        )
      default:
        return NextResponse.json(
          {
            error: 'DatabaseError',
            message: 'Database operation failed',
            statusCode: 500,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 500 }
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'ValidationError',
        message: 'Invalid data provided',
        statusCode: 400,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 400 }
    )
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'UnauthorizedError',
          message: error.message,
          statusCode: 401,
        },
        { status: 401 }
      )
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json(
        {
          error: 'ForbiddenError',
          message: error.message,
          statusCode: 403,
        },
        { status: 403 }
      )
    }

    if (error.message.includes('Not found')) {
      return NextResponse.json(
        {
          error: 'NotFoundError',
          message: error.message,
          statusCode: 404,
        },
        { status: 404 }
      )
    }
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    },
    { status: 500 }
  )
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiError>> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Validate request method
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(request.method)) {
    throw new ApiException(
      405,
      `Method ${request.method} not allowed`,
      { allowedMethods }
    )
  }
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): void {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return
  }

  if (limit.count >= maxRequests) {
    throw new ApiException(
      429,
      'Too many requests',
      {
        retryAfter: Math.ceil((limit.resetTime - now) / 1000),
      }
    )
  }

  limit.count++
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now()
  const entries = Array.from(rateLimitMap.entries())
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute