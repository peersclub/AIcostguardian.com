import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const threads = await prisma.aIThread.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastMessageAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        lastMessageAt: true,
        messageCount: true,
        totalCost: true,
        isPinned: true,
        isArchived: true,
      },
    });

    // Add default values for properties expected by the frontend
    const threadsWithDefaults = threads.map(thread => ({
      ...thread,
      tags: [],
      isShared: false,
      collaborators: [],
      mode: 'standard',
      isLive: false,
      hasError: false,
    }));

    return NextResponse.json({ threads: threadsWithDefaults });
  } catch (error) {
    console.error('Failed to fetch threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title = 'New Chat' } = body;

    // Get user from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const thread = await prisma.aIThread.create({
      data: {
        userId: user.id,
        title,
      },
    });

    // Add default values for properties expected by the frontend
    const threadWithDefaults = {
      ...thread,
      tags: [],
      isShared: false,
      collaborators: [],
      mode: body.mode || 'standard',
      isLive: false,
      hasError: false,
    };

    return NextResponse.json(threadWithDefaults);
  } catch (error) {
    console.error('Failed to create thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}