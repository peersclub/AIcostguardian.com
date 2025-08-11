import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();

    // In a real application, this would create a support ticket
    // or send a notification to admins
    // For now, we'll just log it and return success
    
    console.log(`User ${session.user.email} requested limit increase: ${reason}`);

    // You could also store this in a database table for tracking
    // await prisma.limitIncreaseRequest.create({
    //   data: {
    //     userId: session.user.id,
    //     reason: reason,
    //     status: 'PENDING',
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Your request has been submitted. You will be notified once approved.',
    });
  } catch (error) {
    console.error('Failed to submit limit increase request:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}