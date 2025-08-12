const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirectQuery() {
  try {
    // Get the user
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'victor@aicostguardian.com' } }
    });
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId
    });
    
    // Replicate the exact query from the API
    const where = {
      userId: user.id,
      organizationId: user.organizationId
    };
    
    console.log('\nWhere clause:', where);
    
    // Get total count
    const total = await prisma.notification.count({ where });
    console.log('Total notifications matching query:', total);
    
    // Get actual notifications (first 5)
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        priority: true,
        status: true,
        createdAt: true,
        userId: true,
        organizationId: true
      }
    });
    
    console.log('\nFirst 5 notifications:');
    notifications.forEach((n, i) => {
      console.log(`${i + 1}. ${n.title} (${n.type}) - ${n.status} - Created: ${n.createdAt}`);
    });
    
    console.log('\nChecking if session organizationId matches...');
    console.log('User organizationId:', user.organizationId);
    console.log('Sample notification organizationId:', notifications[0]?.organizationId);
    console.log('Match:', user.organizationId === notifications[0]?.organizationId);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectQuery();