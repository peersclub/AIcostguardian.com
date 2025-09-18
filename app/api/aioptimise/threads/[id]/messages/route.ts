import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const params = 'then' in context.params ? await context.params : context.params;
    const threadId = params.id;

    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 messages per request
    const cursor = searchParams.get('cursor'); // Message ID to start from
    const direction = searchParams.get('direction') || 'desc'; // 'desc' for newer first, 'asc' for older first

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify thread ownership
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: threadId,
        userId: session.user.id,
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Build where clause for cursor-based pagination
    const whereClause: any = { threadId };

    if (cursor) {
      // Get the cursor message to compare timestamps
      const cursorMessage = await prisma.aIMessage.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      });

      if (cursorMessage) {
        whereClause.createdAt = direction === 'desc'
          ? { lt: cursorMessage.createdAt } // Get messages older than cursor
          : { gt: cursorMessage.createdAt }; // Get messages newer than cursor
      }
    }

    const messages = await prisma.aIMessage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: direction === 'desc' ? 'desc' : 'asc',
      },
      take: limit + 1, // Take one extra to check if there are more
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
        selectedModel: true,
        selectedProvider: true,
        recommendedModel: true,
        modelReason: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        cost: true,
        latency: true,
        feedback: true,
        rating: true,
      },
    });

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messageList = hasMore ? messages.slice(0, -1) : messages;

    // Get the cursor for next page (last message in current page)
    const nextCursor = messageList.length > 0 ? messageList[messageList.length - 1].id : null;

    return NextResponse.json({
      messages: messageList,
      hasMore,
      nextCursor: hasMore ? nextCursor : null,
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}