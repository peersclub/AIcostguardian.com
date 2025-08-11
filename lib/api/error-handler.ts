import { NextResponse } from 'next/server';

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  details?: any;
  code?: string;
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