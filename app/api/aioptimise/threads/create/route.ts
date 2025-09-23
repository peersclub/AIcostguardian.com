import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      threadType,
      sharedWithEmails = [],
      collaborators = []
    } = body;

    // Validate thread type
    const validTypes = ['STANDARD', 'DIRECT', 'CHANNEL', 'HUDDLE', 'EXTERNAL', 'PROJECT'];
    if (!validTypes.includes(threadType)) {
      return NextResponse.json({ error: 'Invalid thread type' }, { status: 400 });
    }

    // Get user from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Helper function to determine if a user is external
    const isExternalUser = (email: string, userEmail: string) => {
      const userDomain = userEmail.split('@')[1];
      const emailDomain = email.split('@')[1];
      return userDomain !== emailDomain;
    };

    // Determine if thread has external users
    const allEmails = [...sharedWithEmails, ...collaborators.map((c: any) => c.email)];
    const hasExternalUsers = allEmails.some(email =>
      isExternalUser(email, session.user.email!)
    );

    // Create the thread
    const thread = await prisma.aIThread.create({
      data: {
        userId: user.id,
        title: title || getDefaultTitle(threadType),
        description,
        threadType,
        hasExternalUsers: hasExternalUsers || threadType === 'EXTERNAL',
        sharedWithEmails,
      },
    });

    // Note: Collaborator creation would require finding user IDs by email
    // This is simplified for now - collaborators can be added later via the invite API

    // Fetch the created thread with all relations
    const createdThread = await prisma.aIThread.findUnique({
      where: { id: thread.id },
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

    // Add frontend-expected fields
    const threadWithDefaults = {
      ...createdThread,
      tags: [],
      isShared: (createdThread?.sharedWithEmails?.length || 0) > 0 || (createdThread?.collaborators?.length || 0) > 0,
      mode: 'standard',
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

function getDefaultTitle(threadType: string): string {
  switch (threadType) {
    case 'DIRECT':
      return 'Direct Message';
    case 'CHANNEL':
      return 'New Channel';
    case 'HUDDLE':
      return 'Team Huddle';
    case 'EXTERNAL':
      return 'External Collaboration';
    case 'PROJECT':
      return 'Project Discussion';
    default:
      return 'New Chat';
  }
}