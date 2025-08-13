import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Validate request body against schema
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      }))
      
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: 'Validation failed',
            details: errors 
          },
          { status: 400 }
        ),
      }
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    }
  }
}

// Validate query parameters
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const searchParams = request.nextUrl.searchParams
    const params: Record<string, any> = {}
    
    searchParams.forEach((value, key) => {
      // Handle array parameters (e.g., ?filter=a&filter=b)
      if (params[key]) {
        if (Array.isArray(params[key])) {
          params[key].push(value)
        } else {
          params[key] = [params[key], value]
        }
      } else {
        params[key] = value
      }
    })
    
    const validatedData = schema.parse(params)
    
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      }))
      
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: 'Invalid query parameters',
            details: errors 
          },
          { status: 400 }
        ),
      }
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      ),
    }
  }
}

// Sanitize HTML content
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

// Sanitize object recursively
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize the key as well
        const sanitizedKey = DOMPurify.sanitize(key)
        sanitized[sanitizedKey] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }
  
  return obj
}

// Validate and sanitize file uploads
export interface FileValidationOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.csv'],
  } = options
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
    }
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    }
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`,
    }
  }
  
  // Check for potentially malicious file names
  const sanitizedName = DOMPurify.sanitize(file.name)
  if (sanitizedName !== file.name) {
    return {
      valid: false,
      error: 'File name contains invalid characters',
    }
  }
  
  return { valid: true }
}

// SQL injection prevention helper
export function escapeSQLIdentifier(identifier: string): string {
  // Remove any characters that aren't alphanumeric or underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '')
}

// Prevent NoSQL injection in MongoDB-like queries
export function sanitizeMongoQuery(query: any): any {
  if (typeof query === 'string') {
    return query
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeMongoQuery)
  }
  
  if (query !== null && typeof query === 'object') {
    const sanitized: any = {}
    for (const key in query) {
      if (key.startsWith('$')) {
        // Remove operators that could be dangerous
        continue
      }
      sanitized[key] = sanitizeMongoQuery(query[key])
    }
    return sanitized
  }
  
  return query
}