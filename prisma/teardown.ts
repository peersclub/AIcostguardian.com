import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start tearing down test database...');

  // The order of deletion is important to avoid foreign key constraint violations.
  // Delete records from models that have relations to User or Organization first.

  await prisma.apiKey.deleteMany({});
  await prisma.usageLog.deleteMany({});
  await prisma.usage.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  
  // Now delete the User and Organization records
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('Teardown finished. Test database is clean.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
