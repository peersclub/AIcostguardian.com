import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get user settings from database
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Return settings or defaults, mapping database field names to client field names
    const settings = userSettings ? {
      showMetrics: userSettings.showMetrics,
      showAnalysis: userSettings.showAnalysis,
      autoSave: userSettings.autoSaveThreads,
      autoRetry: userSettings.autoRetryOnError,
      voiceEnabled: userSettings.voiceEnabled,
      theme: userSettings.theme,
      preferredProvider: undefined,
      preferredModel: undefined,
    } : {
      showMetrics: true,
      showAnalysis: true,
      autoSave: true,
      autoRetry: true,
      voiceEnabled: false,
      theme: 'system',
      preferredProvider: undefined,
      preferredModel: undefined,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    // Return default settings on error
    return NextResponse.json({
      showMetrics: true,
      showAnalysis: true,
      autoSave: true,
      autoRetry: true,
      voiceEnabled: false,
      theme: 'system',
      preferredProvider: undefined,
      preferredModel: undefined,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();

    // Upsert user settings
    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        chatMode: settings.chatMode || 'STANDARD',
        showMetrics: settings.showMetrics !== false,
        showAnalysis: settings.showAnalysis !== false,
        voiceEnabled: settings.voiceEnabled || false,
        autoSaveThreads: settings.autoSave !== false,
        autoRetryOnError: settings.autoRetry !== false,
        theme: settings.theme || 'system',
      },
      create: {
        userId: session.user.id,
        chatMode: settings.chatMode || 'STANDARD',
        showMetrics: settings.showMetrics !== false,
        showAnalysis: settings.showAnalysis !== false,
        voiceEnabled: settings.voiceEnabled || false,
        autoSaveThreads: settings.autoSave !== false,
        autoRetryOnError: settings.autoRetry !== false,
        theme: settings.theme || 'system',
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}