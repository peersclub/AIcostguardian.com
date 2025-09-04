import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPIEndpoint() {
  console.log('=== Testing API Endpoint Response ===\n');
  
  // Get user session data
  const user = await prisma.user.findUnique({
    where: { email: 'victor@aicostguardian.com' },
    include: {
      apiKeys: {
        select: {
          id: true,
          provider: true,
          isActive: true,
          lastUsed: true,
          lastTested: true,
          createdAt: true,
          encryptedKey: true
        }
      }
    }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log(`User: ${user.email}`);
  console.log(`Total API keys in database: ${user.apiKeys.length}\n`);
  
  console.log('Keys stored in database:');
  for (const key of user.apiKeys) {
    console.log(`  ${key.provider}:`);
    console.log(`    - ID: ${key.id}`);
    console.log(`    - Active: ${key.isActive ? '✅' : '❌'}`);
    console.log(`    - Has encrypted key: ${key.encryptedKey ? '✅' : '❌'}`);
    console.log(`    - Created: ${key.createdAt.toISOString()}`);
  }
  
  // Check what the API endpoint would return
  console.log('\n=== What API Endpoint Returns ===');
  console.log('The /api/api-keys endpoint returns masked keys without the actual values.');
  console.log('Expected response for this user:');
  
  const maskedKeys = user.apiKeys.map(key => ({
    id: key.id,
    provider: key.provider,
    isActive: key.isActive,
    lastUsed: key.lastUsed,
    lastTested: key.lastTested,
    createdAt: key.createdAt,
    maskedKey: '••••••••••••' + (key.encryptedKey ? '••••' : '')
  }));
  
  console.log(JSON.stringify({ keys: maskedKeys }, null, 2));
  
  await prisma.$disconnect();
}

testAPIEndpoint()
  .catch(console.error);