import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });

  if (!user || !user.organization) {
    return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
  }

  // Simulate a successful subscription upgrade
  await prisma.organization.update({
    where: { id: user.organization.id },
    data: { subscription: SubscriptionTier.GROWTH }, // Assuming GROWTH is a paid tier
  });

  return NextResponse.json({ success: true, message: 'User upgraded to GROWTH tier' });
}
