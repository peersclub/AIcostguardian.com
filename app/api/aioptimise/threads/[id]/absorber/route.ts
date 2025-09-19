import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { absorberMode } = await req.json();

    if (typeof absorberMode !== 'boolean') {
      return NextResponse.json(
        { error: 'absorberMode must be a boolean value' },
        { status: 400 }
      );
    }

    // Check if user has access to the thread
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                acceptedAt: { not: null },
                role: { in: ['EDITOR', 'ADMIN'] }
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Update the thread's absorber mode
    const updatedThread = await prisma.aIThread.update({
      where: { id: params.id },
      data: { aiAbsorberMode: absorberMode }
    });

    // TODO: Add activity logging when AIThreadActivity model is available

    return NextResponse.json({
      success: true,
      aiAbsorberMode: absorberMode,
      message: absorberMode
        ? 'AI Absorber mode enabled - AI will listen but not respond'
        : 'AI Absorber mode disabled - AI will respond normally'
    });
  } catch (error) {
    console.error('Failed to toggle absorber mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle absorber mode' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current absorber mode
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the thread
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                acceptedAt: { not: null }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        aiAbsorberMode: true,
        title: true
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      threadId: thread.id,
      title: thread.title,
      aiAbsorberMode: thread.aiAbsorberMode || false
    });
  } catch (error) {
    console.error('Failed to get absorber mode:', error);
    return NextResponse.json(
      { error: 'Failed to get absorber mode' },
      { status: 500 }
    );
  }
}