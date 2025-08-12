import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  // Parse DATABASE_URL for connection pooling configuration
  const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10')
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Error handling
    errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
  })
}

// Configure connection pool via DATABASE_URL parameters
// Add these to your DATABASE_URL:
// ?connection_limit=20 - Maximum number of connections in the pool
// &pool_timeout=10 - Seconds to wait for a connection from the pool
// &connect_timeout=10 - Seconds to wait for a new connection
// &socket_timeout=10 - Seconds of inactivity before closing a socket
// &statement_timeout=10 - Seconds before cancelling a query
// Example: postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma