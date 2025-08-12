import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email().toLowerCase().trim()
export const uuidSchema = z.string().uuid()
export const urlSchema = z.string().url()

// Sanitize HTML input to prevent XSS
export const sanitizedStringSchema = z.string().transform((val) => {
  // Remove any HTML tags and script content
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
})

// Create sanitized string with max length
export const sanitizedString = (maxLength: number) => 
  z.string().max(maxLength).transform((val) => {
    // Remove any HTML tags and script content
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
  })

// API Key validation schemas
export const apiKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'groq', 'cohere', 'perplexity']),
  apiKey: z.string()
    .min(20, 'API key is too short')
    .max(200, 'API key is too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'API key contains invalid characters'),
})

// Thread operation schemas
export const createThreadSchema = z.object({
  title: sanitizedString(200),
  description: sanitizedString(1000).optional(),
  mode: z.enum(['standard', 'focus', 'coding', 'research', 'creative']).optional(),
})

export const shareThreadSchema = z.object({
  emails: z.array(emailSchema).max(10, 'Cannot share with more than 10 people'),
  expiresIn: z.number().min(3600).max(2592000).optional(), // 1 hour to 30 days
  permissions: z.enum(['view', 'comment', 'edit']).optional(),
})

// Message schemas
export const sendMessageSchema = z.object({
  threadId: uuidSchema,
  message: z.object({
    content: z.string().min(1).max(100000).transform((val) => {
      // Remove any HTML tags and script content
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim()
    }), // Max 100k chars
    images: z.array(z.string().url()).max(10).optional(),
    files: z.array(z.object({
      name: z.string().max(255),
      url: urlSchema,
      size: z.number().max(10485760), // Max 10MB
    })).max(5).optional(),
    metadata: z.record(z.any()).optional(),
  }),
  mode: z.enum(['standard', 'focus', 'coding', 'research', 'creative']).optional(),
  modelOverride: z.object({
    provider: z.string(),
    model: z.string(),
  }).optional(),
})

// Collaborator schemas
export const addCollaboratorSchema = z.object({
  email: emailSchema,
  role: z.enum(['viewer', 'editor', 'moderator']),
})

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1).max(200).transform((val) => {
    // Remove any HTML tags and script content
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
  }),
  filters: z.object({
    providers: z.array(z.string()).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    minCost: z.number().min(0).optional(),
    maxCost: z.number().max(10000).optional(),
  }).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// Usage tracking schemas
export const trackUsageSchema = z.object({
  provider: z.string().max(50),
  model: z.string().max(100),
  operation: z.enum(['completion', 'embedding', 'image', 'audio', 'fine-tune']),
  inputTokens: z.number().min(0).max(1000000),
  outputTokens: z.number().min(0).max(1000000),
  cost: z.number().min(0).max(10000),
  metadata: z.record(z.any()).optional(),
})

// Admin operation schemas
export const adminUserActionSchema = z.object({
  action: z.enum(['suspend', 'unsuspend', 'delete', 'changeRole']),
  reason: sanitizedString(500).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

// Notification schemas
export const createNotificationSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success']),
  title: sanitizedString(200),
  message: sanitizedString(1000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  expiresAt: z.string().datetime().optional(),
})

// Settings schemas
export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  monthlyReport: z.boolean().optional(),
  alertThreshold: z.number().min(0).max(10000).optional(),
  timezone: z.string().max(50).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh']).optional(),
})

// File upload schemas
export const fileUploadSchema = z.object({
  filename: z.string()
    .max(255)
    .regex(/^[a-zA-Z0-9-_. ]+$/, 'Filename contains invalid characters'),
  mimeType: z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
  ]),
  size: z.number().min(1).max(10485760), // Max 10MB
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

/**
 * Validate request body against a schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      return { error: errorMessage }
    }
    return { error: 'Invalid request body' }
  }
}

/**
 * Validate query parameters against a schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data?: T; error?: string } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const data = schema.parse(params)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      return { error: errorMessage }
    }
    return { error: 'Invalid query parameters' }
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

/**
 * Validate and sanitize SQL identifiers (table/column names)
 */
export function validateSQLIdentifier(identifier: string): string {
  // Only allow alphanumeric and underscore
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error('Invalid SQL identifier')
  }
  return identifier
}

/**
 * Escape special characters for SQL LIKE queries
 */
export function escapeSQLLike(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}