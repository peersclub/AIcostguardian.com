import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
                status: 'ACCEPTED'
              }
            }
          }
        ]
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Get all collaborators for the thread
    const collaborators = await prisma.aIThreadCollaborator.findMany({
      where: {
        threadId: params.id,
        status: 'ACCEPTED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        joinedAt: 'desc',
      }
    });

    // Also include the thread owner as an admin collaborator
    const threadOwner = await prisma.user.findUnique({
      where: { id: thread.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });

    const allCollaborators = [
      ...(threadOwner ? [{
        id: 'owner',
        user: threadOwner,
        role: 'ADMIN' as const,
        joinedAt: thread.createdAt,
        isOwner: true,
      }] : []),
      ...collaborators.map(collab => ({
        id: collab.id,
        user: collab.user,
        role: collab.role,
        joinedAt: collab.joinedAt,
        isOwner: false,
      }))
    ];

    return NextResponse.json({ collaborators: allCollaborators });
  } catch (error) {
    console.error('Failed to get collaborators:', error);
    return NextResponse.json(
      { error: 'Failed to get collaborators' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role = 'VIEWER' } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user has permission to add collaborators (owner or admin)
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'ADMIN',
                status: 'ACCEPTED'
              }
            }
          }
        ]
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 403 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a collaborator
    const existingCollaborator = await prisma.aIThreadCollaborator.findUnique({
      where: {
        threadId_userId: {
          threadId: params.id,
          userId: user.id,
        }
      }
    });

    if (existingCollaborator) {
      return NextResponse.json(
        { error: 'User is already a collaborator' },
        { status: 409 }
      );
    }

    // Create collaboration record (no invitation needed for direct add)
    await prisma.aIThreadCollaborator.create({
      data: {
        threadId: params.id,
        userId: user.id,
        role: role as 'VIEWER' | 'EDITOR',
        invitedBy: session.user.id,
        status: 'ACCEPTED',
        invitedAt: new Date(),
        joinedAt: new Date(),
      }
    });

    // Log the activity
    await prisma.aIThreadActivity.create({
      data: {
        threadId: params.id,
        userId: session.user.id,
        action: 'added_collaborator',
        metadata: {
          addedUserId: user.id,
          addedUserName: user.name,
          addedUserEmail: user.email,
          role: role,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${user.name || user.email} added as ${role.toLowerCase()}`
    });
  } catch (error) {
    console.error('Failed to add collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to add collaborator' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update collaborator role
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collaboratorId, role } = await req.json();

    if (!collaboratorId || !role) {
      return NextResponse.json(
        { error: 'Collaborator ID and role are required' },
        { status: 400 }
      );
    }

    // Check if user has permission to manage collaborators (owner or admin)
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'ADMIN',
                status: 'ACCEPTED'
              }
            }
          }
        ]
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 403 }
      );
    }

    // Find the collaborator
    const collaborator = await prisma.aIThreadCollaborator.findUnique({
      where: {
        id: collaboratorId,
        threadId: params.id,
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    // Update the collaborator's role
    await prisma.aIThreadCollaborator.update({
      where: { id: collaboratorId },
      data: { role: role as 'VIEWER' | 'EDITOR' | 'ADMIN' }
    });

    // Log the activity
    await prisma.aIThreadActivity.create({
      data: {
        threadId: params.id,
        userId: session.user.id,
        action: 'updated_collaborator_role',
        metadata: {
          collaboratorId: collaboratorId,
          collaboratorName: collaborator.user.name,
          collaboratorEmail: collaborator.user.email,
          oldRole: collaborator.role,
          newRole: role,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role.toLowerCase()}`
    });
  } catch (error) {
    console.error('Failed to update collaborator role:', error);
    return NextResponse.json(
      { error: 'Failed to update collaborator role' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove collaborator
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const collaboratorId = url.searchParams.get('collaboratorId');

    if (!collaboratorId) {
      return NextResponse.json(
        { error: 'Collaborator ID is required' },
        { status: 400 }
      );
    }

    // Check if user has permission to remove collaborators (owner or admin)
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'ADMIN',
                status: 'ACCEPTED'
              }
            }
          }
        ]
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 403 }
      );
    }

    // Find the collaborator
    const collaborator = await prisma.aIThreadCollaborator.findUnique({
      where: {
        id: collaboratorId,
        threadId: params.id,
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    // Remove the collaborator
    await prisma.aIThreadCollaborator.delete({
      where: { id: collaboratorId }
    });

    // Log the activity
    await prisma.aIThreadActivity.create({
      data: {
        threadId: params.id,
        userId: session.user.id,
        action: 'removed_collaborator',
        metadata: {
          removedUserId: collaborator.userId,
          removedUserName: collaborator.user.name,
          removedUserEmail: collaborator.user.email,
          role: collaborator.role,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${collaborator.user.name || collaborator.user.email} removed from thread`
    });
  } catch (error) {
    console.error('Failed to remove collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}