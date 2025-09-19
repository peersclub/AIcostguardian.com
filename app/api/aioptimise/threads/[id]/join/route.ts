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

    // Check if there's a pending invitation for this user
    const invitation = await prisma.threadCollaborator.findUnique({
      where: {
        threadId_userId: {
          threadId: params.id,
          userId: session.user.id,
        },
        acceptedAt: null,
      },
      include: {
        thread: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'No pending invitation found for this thread' },
        { status: 404 }
      );
    }

    // Accept the invitation by updating the status
    const updatedCollaboration = await prisma.threadCollaborator.update({
      where: {
        id: invitation.id,
      },
      data: {
        acceptedAt: new Date(),
      }
    });

    // TODO: Add activity logging when AIThreadActivity model is available

    // Send notification to the thread owner and inviter
    const notificationTargets = new Set([
      invitation.thread.user.id,
      invitation.invitedBy
    ]);

    for (const targetUserId of Array.from(notificationTargets)) {
      if (targetUserId && targetUserId !== session.user.id) {
        try {
          await notificationService.sendNotification({
            type: 'system_notification',
            title: 'Thread Collaboration Accepted',
            message: `${session.user.name || session.user.email} has joined thread "${invitation.thread.title}" as a ${invitation.role.toLowerCase()}.`,
            severity: 'info',
            userId: targetUserId,
            timestamp: new Date(),
            metadata: {
              threadId: params.id,
              threadTitle: invitation.thread.title,
              collaboratorName: session.user.name || session.user.email,
              role: invitation.role,
              action: 'thread_joined',
            }
          });
        } catch (notificationError) {
          console.warn('Failed to send notification to user:', targetUserId, notificationError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined thread "${invitation.thread.title}"`,
      collaboration: {
        threadId: params.id,
        userId: session.user.id,
        role: invitation.role,
        acceptedAt: new Date(),
      },
      thread: {
        id: invitation.thread.id,
        title: invitation.thread.title,
      }
    });

  } catch (error) {
    console.error('Failed to join thread:', error);
    return NextResponse.json(
      { error: 'Failed to join thread' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to decline an invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if there's a pending invitation for this user
    const invitation = await prisma.threadCollaborator.findUnique({
      where: {
        threadId_userId: {
          threadId: params.id,
          userId: session.user.id,
        },
        acceptedAt: null,
      },
      include: {
        thread: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'No pending invitation found for this thread' },
        { status: 404 }
      );
    }

    // Decline the invitation by deleting the record
    await prisma.threadCollaborator.delete({
      where: {
        id: invitation.id,
      }
    });

    // TODO: Add activity logging when AIThreadActivity model is available

    // Send notification to the inviter
    if (invitation.invitedBy && invitation.invitedBy !== session.user.id) {
      try {
        await notificationService.sendNotification({
          type: 'system_notification',
          title: 'Thread Invitation Declined',
          message: `${session.user.name || session.user.email} has declined the invitation to collaborate on thread "${invitation.thread.title}".`,
          severity: 'info',
          userId: invitation.invitedBy,
          timestamp: new Date(),
          metadata: {
            threadId: params.id,
            threadTitle: invitation.thread.title,
            collaboratorName: session.user.name || session.user.email,
            role: invitation.role,
            action: 'invitation_declined',
          }
        });
      } catch (notificationError) {
        console.warn('Failed to send decline notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Declined invitation to thread "${invitation.thread.title}"`,
    });

  } catch (error) {
    console.error('Failed to decline invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}