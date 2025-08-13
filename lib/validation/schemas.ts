import { z } from 'zod'
import validator from 'validator'

// Custom validators
const email = z.string().email().refine(
  (val) => validator.isEmail(val),
  { message: 'Invalid email address' }
)

const url = z.string().url().refine(
  (val) => validator.isURL(val, { protocols: ['http', 'https'] }),
  { message: 'Invalid URL' }
)

const alphanumeric = z.string().refine(
  (val) => validator.isAlphanumeric(val.replace(/[\s-_]/g, '')),
  { message: 'Must contain only letters, numbers, spaces, hyphens, and underscores' }
)

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .transform(val => validator.escape(val)), // Sanitize HTML
  domain: z.string()
    .min(3, 'Domain must be at least 3 characters')
    .max(100, 'Domain must be less than 100 characters')
    .refine(val => validator.isFQDN(val) || validator.isAlphanumeric(val.replace(/[.-]/g, '')), {
      message: 'Invalid domain format'
    }),
  contactEmail: email,
  industry: z.string()
    .max(50, 'Industry must be less than 50 characters')
    .optional()
    .transform(val => val ? validator.escape(val) : val),
  size: z.enum(['STARTUP', 'SMB', 'ENTERPRISE']).optional(),
  subscription: z.enum(['FREE', 'GROWTH', 'ENTERPRISE']).optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// User schemas
export const createUserSchema = z.object({
  email: email,
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform(val => validator.escape(val)),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER']).optional(),
  department: z.string()
    .max(50, 'Department must be less than 50 characters')
    .optional()
    .transform(val => val ? validator.escape(val) : val),
  jobTitle: z.string()
    .max(50, 'Job title must be less than 50 characters')
    .optional()
    .transform(val => val ? validator.escape(val) : val),
})

export const inviteUserSchema = z.object({
  email: email,
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']).default('USER'),
  department: z.string()
    .max(50)
    .optional()
    .transform(val => val ? validator.escape(val) : val),
})

// API Key schemas
export const createApiKeySchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .transform(val => validator.escape(val)),
  provider: z.enum(['openai', 'anthropic', 'google', 'grok', 'perplexity']),
  key: z.string()
    .min(10, 'API key must be at least 10 characters')
    .max(500, 'API key must be less than 500 characters')
    .refine(val => !val.includes(' '), {
      message: 'API key cannot contain spaces'
    }),
})

// Usage tracking schemas
export const trackUsageSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'grok', 'perplexity']),
  model: z.string()
    .max(100, 'Model name must be less than 100 characters')
    .transform(val => validator.escape(val)),
  promptTokens: z.number().int().min(0),
  completionTokens: z.number().int().min(0),
  cost: z.number().min(0),
  metadata: z.record(z.unknown()).optional(),
})

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string()
    .max(200, 'Search query must be less than 200 characters')
    .transform(val => validator.escape(val)),
  filters: z.object({
    provider: z.enum(['openai', 'anthropic', 'google', 'grok', 'perplexity']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    userId: z.string().uuid().optional(),
  }).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Bulk upload schema
export const bulkUploadSchema = z.object({
  users: z.array(
    z.object({
      email: email,
      name: z.string()
        .min(1)
        .max(100)
        .transform(val => validator.escape(val)),
      role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']).optional(),
      department: z.string()
        .max(50)
        .optional()
        .transform(val => val ? validator.escape(val) : val),
    })
  ).min(1, 'At least one user is required')
    .max(100, 'Cannot upload more than 100 users at once'),
})

// Notification schemas
export const createNotificationSchema = z.object({
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .transform(val => validator.escape(val)),
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message must be less than 500 characters')
    .transform(val => validator.escape(val)),
  userId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
})

// Settings schemas
export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  slackNotifications: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  usageAlerts: z.boolean().optional(),
  alertThreshold: z.number().min(0).max(10000).optional(),
})

// Export schemas
export const exportDataSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  type: z.enum(['usage', 'costs', 'users', 'full']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeMetadata: z.boolean().default(false),
})

// Helper function to validate and sanitize input
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Sanitization utilities
export const sanitize = {
  html: (input: string) => validator.escape(input),
  email: (input: string) => validator.normalizeEmail(input) || input,
  url: (input: string) => validator.isURL(input) ? input : '',
  alphanumeric: (input: string) => input.replace(/[^a-zA-Z0-9\s-_]/g, ''),
  number: (input: string) => parseInt(validator.escape(input), 10),
  boolean: (input: string) => validator.toBoolean(input),
}