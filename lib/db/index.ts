// Central database exports
import { prisma } from '../prisma'
export { prisma }
export * from '../services/database'
export * from '../services/encryption'

// Re-export Prisma types for convenience
export {
  UserRole,
  SubscriptionTier,
  AlertType,
  type User,
  type Organization,
  type ApiKey,
  type UsageLog,
  type Alert,
  type Session,
} from '@prisma/client'

// Database utility functions
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Transaction helper
export async function withTransaction<T>(
  fn: (tx: any) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn as any) as Promise<T>
}

// Cleanup function for testing or shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}