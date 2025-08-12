import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { threadManager } from '@/src/services/thread-manager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await threadManager.removeCollaborator(
      params.id,
      params.collaboratorId,
      session.user.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await req.json();
    
    if (!role || !['VIEWER', 'EDITOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // TODO: Implement role update in thread manager
    // await threadManager.updateCollaboratorRole(
    //   params.id,
    //   params.collaboratorId,
    //   role,
    //   session.user.id
    // );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update collaborator role:', error);
    return NextResponse.json(
      { error: 'Failed to update collaborator role' },
      { status: 500 }
    );
  }
}