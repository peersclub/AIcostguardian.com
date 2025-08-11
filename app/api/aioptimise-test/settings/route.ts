import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Mock settings
    const settings = {
      showMetrics: true,
      showAnalysis: true,
      autoSave: true,
      autoRetry: true,
      voiceEnabled: false,
      theme: 'dark',
      preferredProvider: 'openai',
      preferredModel: 'gpt-4o',
    };
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}