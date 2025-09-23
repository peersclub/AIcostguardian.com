import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database using email since JWT strategy doesn't provide reliable user.id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get threads with all new fields including collaborators for external user detection
    const threads = await prisma.aIThread.findMany({
      where: {
        userId: user.id,
        isArchived: false,
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastMessageAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        lastMessageAt: true,
        messageCount: true,
        totalCost: true,
        isPinned: true,
        isArchived: true,
        isStarred: true,
        threadType: true,
        hasExternalUsers: true,
        sharedWithEmails: true,
        collaborators: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              }
            }
          }
        }
      },
    });

    // Helper function to determine if a user is external
    const isExternalUser = (email: string, userEmail: string) => {
      const userDomain = userEmail.split('@')[1];
      const emailDomain = email.split('@')[1];
      return userDomain !== emailDomain;
    };

    // Process threads to detect external users and add required fields
    const threadsWithDefaults = threads.map(thread => {
      // Detect external users from collaborators and shared emails
      const collaboratorEmails = thread.collaborators.map(c => c.user.email);
      const allEmails = [...collaboratorEmails, ...(thread.sharedWithEmails || [])];

      const hasExternalUsers = allEmails.some(email =>
        isExternalUser(email, session.user.email!)
      );

      return {
        ...thread,
        hasExternalUsers: hasExternalUsers || thread.hasExternalUsers,
        tags: [],
        isShared: (thread.sharedWithEmails?.length || 0) > 0 || thread.collaborators.length > 0,
        mode: 'standard',
        isLive: false,
        hasError: false,
      };
    });

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
    const {
      title = 'New Chat',
      description,
      threadType = 'STANDARD',
      sharedWithEmails = []
    } = body;

    // Get user from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine if thread has external users
    const hasExternalUsers = sharedWithEmails.some((email: string) => {
      const userDomain = session.user.email!.split('@')[1];
      const emailDomain = email.split('@')[1];
      return userDomain !== emailDomain;
    });

    const thread = await prisma.aIThread.create({
      data: {
        userId: user.id,
        title,
        description,
        threadType,
        hasExternalUsers,
        sharedWithEmails,
      },
    });

    // Add default values for properties expected by the frontend
    const threadWithDefaults = {
      ...thread,
      tags: [],
      isShared: sharedWithEmails.length > 0,
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