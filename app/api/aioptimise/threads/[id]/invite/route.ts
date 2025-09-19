import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/services/notification-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId, role = 'VIEWER' } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['VIEWER', 'EDITOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be VIEWER or EDITOR' },
        { status: 400 }
      );
    }

    // Check if thread exists and user has permission to invite
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: { in: ['EDITOR', 'ADMIN'] }
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            organizationId: true,
          }
        }
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Check if member exists and is in the same organization
    const member = await prisma.user.findUnique({
      where: {
        id: memberId,
        organizationId: thread.user.organizationId || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        organizationId: true,
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found or not in the same organization' },
        { status: 404 }
      );
    }

    // Check if member is already a collaborator
    const existingCollaborator = await prisma.threadCollaborator.findUnique({
      where: {
        threadId_userId: {
          threadId: params.id,
          userId: memberId,
        }
      }
    });

    if (existingCollaborator) {
      return NextResponse.json(
        { error: 'Member is already a collaborator on this thread' },
        { status: 409 }
      );
    }

    // Create the collaboration invitation
    await prisma.threadCollaborator.create({
      data: {
        threadId: params.id,
        userId: memberId,
        role: role as 'VIEWER' | 'EDITOR',
        invitedBy: session.user.id,
        invitedAt: new Date(),
        // acceptedAt is null for pending invitations
      }
    });

    // TODO: Add activity logging when AIThreadActivity model is available

    // Send notification to the invited user
    try {
      await notificationService.sendNotification({
        type: 'system_notification',
        title: 'Thread Collaboration Invitation',
        message: `${session.user.name || session.user.email} has invited you to collaborate on thread "${thread.title}" as a ${role.toLowerCase()}.`,
        severity: 'info',
        userId: memberId,
        timestamp: new Date(),
        metadata: {
          threadId: params.id,
          threadTitle: thread.title,
          inviterName: session.user.name || session.user.email,
          role: role,
          action: 'thread_invitation',
        }
      });
    } catch (notificationError) {
      console.warn('Failed to send notification:', notificationError);
      // Continue with the response even if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${member.name || member.email}`,
      collaboration: {
        threadId: params.id,
        userId: memberId,
        role: role,
        acceptedAt: null,
        invitedAt: new Date(),
      }
    });

  } catch (error) {
    console.error('Failed to invite member to thread:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch pending invitations for a thread
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
              some: { userId: session.user.id }
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

    // Get pending invitations
    const pendingInvitations = await prisma.threadCollaborator.findMany({
      where: {
        threadId: params.id,
        acceptedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        invitedAt: 'desc',
      }
    });

    return NextResponse.json({
      invitations: pendingInvitations.map(invitation => ({
        id: invitation.id,
        user: invitation.user,
        role: invitation.role,
        invitedBy: invitation.inviter,
        invitedAt: invitation.invitedAt,
        status: invitation.acceptedAt ? 'ACCEPTED' : 'PENDING',
      }))
    });

  } catch (error) {
    console.error('Failed to get thread invitations:', error);
    return NextResponse.json(
      { error: 'Failed to get invitations' },
      { status: 500 }
    );
  }
}