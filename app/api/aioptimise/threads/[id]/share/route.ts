import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { threadManager } from '@/src/services/thread-manager';

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

    const body = await req.json();
    const result = await threadManager.shareThread(
      params.id,
      session.user.id,
      body.options || {}
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to share thread:', error);
    return NextResponse.json(
      { error: 'Failed to share thread' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await threadManager.unshareThread(params.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unshare thread:', error);
    return NextResponse.json(
      { error: 'Failed to unshare thread' },
      { status: 500 }
    );
  }
}