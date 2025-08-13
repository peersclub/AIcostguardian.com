// Environment variable validation and defaults
export function checkRequiredEnvVars() {
  const required = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  // Warn in development
  if (missing.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Missing environment variables:', missing.join(', '))
    console.warn('⚠️  Some features may not work correctly')
  }
}

// Optional feature flags with defaults
export const ENV_CONFIG = {
  // Redis
  REDIS_URL: process.env.UPSTASH_REDIS_REST_URL || '',
  REDIS_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  
  // Features
  ENABLE_SLACK: process.env.ENABLE_SLACK_NOTIFICATIONS === 'true',
  ENABLE_EMAIL: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  
  // Security
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'default-dev-key-change-in-production',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Auth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  
  // Development
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
}

// Validate on module load
if (typeof window === 'undefined') {
  checkRequiredEnvVars()
}