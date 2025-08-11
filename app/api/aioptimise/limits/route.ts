import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get usage limits from database
    const usageLimit = await prisma.usageLimit.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate current usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Get daily usage - messages are related through threads
    const dailyUsage = await prisma.aIMessage.aggregate({
      where: {
        thread: {
          userId: session.user.id,
        },
        createdAt: {
          gte: today,
        },
      },
      _sum: {
        cost: true,
      },
    });

    // Get monthly usage - messages are related through threads
    const monthlyUsage = await prisma.aIMessage.aggregate({
      where: {
        thread: {
          userId: session.user.id,
        },
        createdAt: {
          gte: thisMonth,
        },
      },
      _sum: {
        cost: true,
      },
    });

    return NextResponse.json({
      dailyLimit: usageLimit?.dailyLimit || 10,
      monthlyLimit: usageLimit?.monthlyLimit || 100,
      dailyUsed: dailyUsage._sum.cost || 0,
      monthlyUsed: monthlyUsage._sum.cost || 0,
      isRestricted: usageLimit?.isRestricted || false,
    });
  } catch (error) {
    console.error('Failed to fetch usage limits:', error);
    // Return default limits on error
    return NextResponse.json({
      dailyLimit: 10,
      monthlyLimit: 100,
      dailyUsed: 0,
      monthlyUsed: 0,
      isRestricted: false,
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dailyLimit, monthlyLimit } = await request.json();

    // Update usage limits
    const updatedLimit = await prisma.usageLimit.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        dailyLimit: dailyLimit || 10,
        monthlyLimit: monthlyLimit || 100,
      },
      create: {
        userId: session.user.id,
        dailyLimit: dailyLimit || 10,
        monthlyLimit: monthlyLimit || 100,
        isRestricted: false,
      },
    });

    return NextResponse.json(updatedLimit);
  } catch (error) {
    console.error('Failed to update usage limits:', error);
    return NextResponse.json(
      { error: 'Failed to update usage limits' },
      { status: 500 }
    );
  }
}