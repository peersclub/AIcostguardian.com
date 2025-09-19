import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User not in organization' }, { status: 400 });
    }

    const body = await request.json();
    const {
      requestMessage,
      currentSettings,
      requestedChanges
    } = body;

    if (!requestMessage) {
      return NextResponse.json({ error: 'Request message is required' }, { status: 400 });
    }

    // Get or create organization settings
    let organizationSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: user.organizationId }
    });

    if (!organizationSettings) {
      organizationSettings = await prisma.organizationSettings.create({
        data: {
          organizationId: user.organizationId,
          pendingRequests: []
        }
      });
    }

    // Create the change request
    const changeRequest = {
      id: Date.now().toString(), // Simple ID generation
      userId: session.user.id,
      userName: user.name || user.email,
      requestMessage,
      currentSettings,
      requestedChanges,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add to pending requests
    const existingRequests = organizationSettings.pendingRequests as any[] || [];
    const updatedRequests = [...existingRequests, changeRequest];

    await prisma.organizationSettings.update({
      where: { organizationId: user.organizationId },
      data: {
        pendingRequests: updatedRequests
      }
    });

    return NextResponse.json({
      success: true,
      requestId: changeRequest.id,
      message: 'Change request submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting change request:', error);
    return NextResponse.json(
      { error: 'Failed to submit change request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User not in organization' }, { status: 400 });
    }

    // Check if user is admin/owner to view requests
    if (user.role !== 'ADMIN' && user.role !== 'OWNER' && !user.isSuperAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const organizationSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: user.organizationId }
    });

    const pendingRequests = organizationSettings?.pendingRequests as any[] || [];

    return NextResponse.json({
      pendingRequests,
      count: pendingRequests.length
    });

  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change requests' },
      { status: 500 }
    );
  }
}