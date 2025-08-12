const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugNotifications() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'victor@aicostguardian.com' } }
    });
    
    console.log('User:', {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId
    });
    
    // Test different query scenarios
    console.log('\n--- Query 1: Only userId ---');
    const byUserId = await prisma.notification.count({
      where: { userId: user.id }
    });
    console.log('Count by userId only:', byUserId);
    
    console.log('\n--- Query 2: userId + organizationId (current API logic) ---');
    const byBoth = await prisma.notification.count({
      where: { 
        userId: user.id,
        organizationId: user.organizationId
      }
    });
    console.log('Count by userId + organizationId:', byBoth);
    
    console.log('\n--- Query 3: userId + organizationId with OR fallback ---');
    const withFallback = await prisma.notification.count({
      where: { 
        userId: user.id,
        OR: [
          { organizationId: user.organizationId },
          { organizationId: null },
          { organizationId: user.id }
        ]
      }
    });
    console.log('Count with OR fallback:', withFallback);
    
    console.log('\n--- Sample notification organizationIds ---');
    const sampleNotifications = await prisma.notification.findMany({
      where: { userId: user.id },
      select: { id: true, organizationId: true },
      take: 5
    });
    console.log('Sample organizationIds:', sampleNotifications.map(n => n.organizationId));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

debugNotifications();