import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recommendationId, settings, adminOverride, implementedBy } = body;

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Validate required settings fields
    if (!settings.provider || !settings.model) {
      return NextResponse.json({
        error: 'Provider and model are required'
      }, { status: 400 });
    }

    // Create or update organization settings with admin override
    const organizationSettings = await prisma.organizationSettings.upsert({
      where: { organizationId: user.organization.id },
      update: {
        adminOverrides: settings,
        overrideReason: settings.reason || `Admin override from recommendation: ${recommendationId}`,
        overriddenBy: session.user.id,
        overriddenAt: new Date(),
        recommendationId: recommendationId
      },
      create: {
        organizationId: user.organization.id,
        adminOverrides: settings,
        overrideReason: settings.reason || `Admin override from recommendation: ${recommendationId}`,
        overriddenBy: session.user.id,
        overriddenAt: new Date(),
        recommendationId: recommendationId
      }
    });

    // Log the implementation in audit logs for tracking
    try {
      await prisma.auditLog.create({
        data: {
          action: 'admin_settings_override',
          severity: 'MEDIUM',
          userId: session.user.id,
          targetId: user.organization.id,
          targetType: 'Organization',
          metadata: {
            recommendationId,
            settings,
            organizationId: user.organization.id,
            implementedBy: implementedBy || session.user.email
          },
          success: true
        }
      });
    } catch (activityError) {
      // Activity logging is optional, continue if it fails
      console.warn('Could not log audit activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      message: 'Project settings implemented successfully',
      data: {
        organizationId: user.organization.id,
        settings: organizationSettings.adminOverrides,
        implementedAt: organizationSettings.overriddenAt,
        implementedBy: implementedBy || session.user.email
      }
    });

  } catch (error) {
    console.error('Error implementing project settings:', error);
    return NextResponse.json(
      { error: 'Failed to implement project settings' },
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

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get current organization settings
    const organizationSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: user.organization.id }
    });

    return NextResponse.json({
      success: true,
      data: {
        organizationId: user.organization.id,
        hasAdminOverrides: !!organizationSettings?.adminOverrides,
        settings: organizationSettings?.adminOverrides || null,
        overrideReason: organizationSettings?.overrideReason,
        overriddenBy: organizationSettings?.overriddenBy,
        overriddenAt: organizationSettings?.overriddenAt,
        recommendationId: organizationSettings?.recommendationId
      }
    });

  } catch (error) {
    console.error('Error fetching project settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project settings' },
      { status: 500 }
    );
  }
}