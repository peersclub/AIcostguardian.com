import { PrismaClient, SubscriptionTier, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding for test environment...');

  // Create a test organization
  const organization = await prisma.organization.upsert({
    where: { domain: 'test.com' },
    update: {},
    create: {
      name: 'Test Organization',
      domain: 'test.com',
      subscription: SubscriptionTier.FREE,
    },
  });

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'testuser@test.com' },
    update: {},
    create: {
      email: 'testuser@test.com',
      name: 'Test User',
      role: UserRole.ADMIN,
      organizationId: organization.id,
    },
  });

  console.log(`Seeding finished. Created organization with id: ${organization.id}`);
  console.log(`Created test user with id: ${testUser.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
