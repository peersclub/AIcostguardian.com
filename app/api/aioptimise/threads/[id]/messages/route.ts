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

    const messages = await prisma.aIMessage.findMany({
      where: {
        threadId,
      },
      orderBy: {
        createdAt: 'asc',
      },
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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}