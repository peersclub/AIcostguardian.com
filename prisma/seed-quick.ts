import { PrismaClient } from '@prisma/client'
import { encrypt } from '../lib/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting quick production seed...')
  
  // Create production organization
  const prodOrg = await prisma.organization.upsert({
    where: { domain: 'aicostoptimiser.com' },
    update: {},
    create: {
      name: 'AI Cost Optimiser',
      domain: 'aicostoptimiser.com',
      subscription: 'ENTERPRISE',
      spendLimit: 100000,
      monthlySpend: 0
    }
  })
  console.log('✅ Created production organization')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aicostoptimiser.com' },
    update: {},
    create: {
      email: 'admin@aicostoptimiser.com',
      name: 'Admin',
      role: 'ADMIN',
      organizationId: prodOrg.id,
      emailVerified: new Date()
    }
  })
  console.log('✅ Created admin user')

  console.log('\n' + '='.repeat(60))
  console.log('🎉 PRODUCTION SEED COMPLETE!')
  console.log('='.repeat(60))
  console.log('\n📝 Admin Credentials:')
  console.log('  Email: admin@aicostoptimiser.com')
  console.log('  Organization: AI Cost Optimiser')
  console.log('\n✅ Ready for production deployment!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })