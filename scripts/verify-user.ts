import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUser() {
  console.log('=== Verifying User Data ===\n');
  
  // Find the user victor@aicostguardian.com
  const user = await prisma.user.findUnique({
    where: {
      email: 'victor@aicostguardian.com'
    },
    include: {
      organization: true,
      apiKeys: {
        select: {
          id: true,
          provider: true,
          isActive: true,
          createdAt: true
        }
      }
    }
  });
  
  if (user) {
    console.log('User found:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Organization: ${user.organization?.name} (ID: ${user.organizationId})`);
    console.log(`\nExisting API Keys: ${user.apiKeys.length}`);
    
    for (const key of user.apiKeys) {
      console.log(`  - ${key.provider}: ${key.isActive ? '✅' : '❌'} (Created: ${key.createdAt.toISOString().split('T')[0]})`);
    }
    
    return user;
  } else {
    console.log('❌ User not found with email: victor@aicostguardian.com');
    
    // List all users to help debug
    console.log('\nAll users in database:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    for (const u of allUsers) {
      console.log(`  - ${u.email || 'No email'} (${u.name}) - ID: ${u.id}`);
    }
  }
  
  await prisma.$disconnect();
}

verifyUser()
  .catch(console.error);