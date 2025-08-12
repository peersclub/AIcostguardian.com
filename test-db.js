const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testConnection() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    // Try to connect
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Try a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ Found ${userCount} users in database`)
    
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()