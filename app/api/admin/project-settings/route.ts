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

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER' && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      organizationId,
      settings,
      reason,
      recommendationId
    } = body;

    if (!organizationId || !settings) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const organizationSettings = await prisma.organizationSettings.upsert({
      where: { organizationId },
      update: {
        adminOverrides: settings,
        overrideReason: reason,
        overriddenBy: session.user.id,
        overriddenAt: new Date(),
        recommendationId: recommendationId || null,
      },
      create: {
        organizationId,
        adminOverrides: settings,
        overrideReason: reason,
        overriddenBy: session.user.id,
        overriddenAt: new Date(),
        recommendationId: recommendationId || null,
      }
    });

    return NextResponse.json({
      success: true,
      organizationSettings,
      message: 'Admin project settings override applied successfully'
    });

  } catch (error) {
    console.error('Error applying admin project settings override:', error);
    return NextResponse.json(
      { error: 'Failed to apply admin project settings override' },
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

    const organizationSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: user.organizationId },
      include: {
        overriddenByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      organizationSettings,
      hasOverrides: !!organizationSettings?.adminOverrides
    });

  } catch (error) {
    console.error('Error fetching admin project settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin project settings' },
      { status: 500 }
    );
  }
}