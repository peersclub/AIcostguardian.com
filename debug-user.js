const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'victor@aicostguardian.com' } }
    });
    console.log('User record:', JSON.stringify(user, null, 2));
    
    const notifications = await prisma.notification.findMany({
      where: { userId: user?.id },
      take: 3
    });
    console.log('Sample notifications:', JSON.stringify(notifications.map(n => ({ 
      id: n.id, 
      userId: n.userId, 
      organizationId: n.organizationId 
    })), null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkUser();