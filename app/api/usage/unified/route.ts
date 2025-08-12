import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This endpoint is temporarily disabled as the unified metrics model is being refactored
    return NextResponse.json(
      { 
        error: 'This endpoint is temporarily unavailable',
        message: 'Unified metrics are being migrated to a new data model'
      }, 
      { status: 503 }
    );

  } catch (error) {
    console.error('Failed to fetch unified usage metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}