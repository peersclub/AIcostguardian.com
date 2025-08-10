// lib/errors.ts
// Comprehensive error handling

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'AUTHZ_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT', { retryAfter });
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

// Logger service
class Logger {
  async error(message: string, context: any) {
    console.error(`[ERROR] ${message}`, context);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, DataDog, etc.
      try {
        await this.sendToErrorTracking(message, context);
      } catch (e) {
        console.error('Failed to send error to tracking service:', e);
      }
    }
  }
  
  async warn(message: string, context?: any) {
    console.warn(`[WARN] ${message}`, context);
  }
  
  async info(message: string, context?: any) {
    console.log(`[INFO] ${message}`, context);
  }
  
  async debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }
  
  private async sendToErrorTracking(message: string, context: any) {
    // Implement error tracking service integration
    // Example: Sentry, DataDog, New Relic, etc.
  }
}

export const logger = new Logger();

export async function handleApiError(error: any, requestId: string) {
  // Log to monitoring service
  await logger.error('API Error', {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    requestId,
  });
  
  // Determine response
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        requestId,
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        requestId,
      },
      { status: 400 }
    );
  }
  
  // Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      {
        success: false,
        error: 'Resource already exists',
        code: 'DUPLICATE_ERROR',
        requestId,
      },
      { status: 409 }
    );
  }
  
  if (error.code === 'P2025') {
    return NextResponse.json(
      {
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
        requestId,
      },
      { status: 404 }
    );
  }
  
  // Generic error
  return NextResponse.json(
    {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_ERROR',
      requestId,
    },
    { status: 500 }
  );
}

// Rate limiting helper
interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

export async function rateLimit(req: Request): Promise<RateLimitResult> {
  // Simple in-memory rate limiting for development
  // In production, use Redis or a dedicated rate limiting service
  
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `rate-limit:${ip}`;
  
  // For now, always allow
  return { success: true };
  
  // Production implementation would use Redis:
  // const count = await redis.incr(key);
  // if (count === 1) {
  //   await redis.expire(key, 60); // 60 second window
  // }
  // 
  // const limit = 100; // 100 requests per minute
  // if (count > limit) {
  //   const ttl = await redis.ttl(key);
  //   return { success: false, retryAfter: ttl };
  // }
  // 
  // return { success: true };
}

// Permission checking helper
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  // Check user permissions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, organizationId: true },
  });
  
  if (!user) {
    return false;
  }
  
  // Super admins have all permissions
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }
  
  // Check specific permissions based on role and context
  const [resource, action] = permission.split(':');
  
  switch (user.role) {
    case 'ADMIN':
      // Admins can do most things except system-level operations
      return !permission.startsWith('system:');
      
    case 'USER':
      // Regular users have limited permissions
      const userPermissions = [
        'usage:read',
        'usage:create',
        'alerts:read',
        'alerts:create',
        'alerts:update',
        'alerts:delete',
        'apikeys:read',
        'apikeys:create',
        'apikeys:update',
        'apikeys:delete',
        'profile:read',
        'profile:update',
      ];
      return userPermissions.includes(permission);
      
    default:
      return false;
  }
}

// Audit logging helper
export async function logActivity(data: {
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: any;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource || '',
        resourceId: data.resourceId,
        metadata: data.metadata || {},
      },
    });
  } catch (error) {
    logger.error('Failed to log activity', { error, data });
  }
}