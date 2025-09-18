import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { ProjectType } from '@prisma/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
      },
      include: {
        context: {
          include: {
            lastEditor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // If no context exists, create a default one using template
    if (!thread.context) {
      const defaultContext = await prisma.threadContext.create({
        data: {
          threadId: params.id,
          projectName: 'Chat - General conversation',
          projectType: ProjectType.GENERAL,
          systemPrompt: 'You are a helpful AI assistant designed to assist with general conversations and everyday tasks. Be conversational, friendly, and provide clear, helpful responses.',
          instructions: 'Help the user with general questions, casual conversations, and everyday tasks. Maintain a friendly and approachable tone.',
          defaultModel: 'gpt-4o-mini',
          defaultProvider: 'openai',
          temperature: 0.7,
          maxTokens: 4000,
          contextWindow: 8000,
          memoryEnabled: true,
          memorySize: 50,
          allowEditing: true,
          requireApproval: false,
          projectGoals: 'Provide helpful assistance for general topics and conversations',
          expectedOutcome: 'Clear, friendly, and helpful responses to user questions',
          keywords: ['general', 'conversation', 'chat', 'help'],
          version: 1
        },
        include: {
          lastEditor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });

      return NextResponse.json(defaultContext);
    }

    return NextResponse.json(thread.context);
  } catch (error) {
    console.error('Failed to get thread context:', error);
    return NextResponse.json(
      { error: 'Failed to get thread context' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Check if user has editing permission
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
        context: true
      }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found or insufficient permissions' }, { status: 404 });
    }

    // Validate the data
    const allowedFields = [
      'projectName',
      'projectType',
      'systemPrompt',
      'instructions',
      'defaultModel',
      'defaultProvider',
      'temperature',
      'maxTokens',
      'topP',
      'contextWindow',
      'memoryEnabled',
      'memorySize',
      'allowEditing',
      'requireApproval',
      'category',
      'keywords',
      'projectGoals',
      'expectedOutcome'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Add versioning and edit tracking
    updateData.lastEditedBy = session.user.id;
    updateData.lastEditedAt = new Date();
    updateData.version = { increment: 1 };

    let context;
    if (thread.context) {
      // Update existing context
      context = await prisma.threadContext.update({
        where: { threadId: params.id },
        data: updateData,
        include: {
          lastEditor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });
    } else {
      // Create new context
      context = await prisma.threadContext.create({
        data: {
          threadId: params.id,
          ...updateData,
          version: 1
        },
        include: {
          lastEditor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });
    }

    return NextResponse.json(context);
  } catch (error) {
    console.error('Failed to update thread context:', error);
    return NextResponse.json(
      { error: 'Failed to update thread context' },
      { status: 500 }
    );
  }
}

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

    // Check if user owns the thread
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found or insufficient permissions' }, { status: 404 });
    }

    // Create initial context for the thread
    const context = await prisma.threadContext.create({
      data: {
        threadId: params.id,
        projectName: body.projectName || thread.title,
        projectType: body.projectType || ProjectType.GENERAL,
        systemPrompt: body.systemPrompt,
        instructions: body.instructions,
        defaultModel: body.defaultModel || 'gpt-4o-mini',
        defaultProvider: body.defaultProvider || 'openai',
        temperature: body.temperature ?? 0.7,
        maxTokens: body.maxTokens ?? 4000,
        topP: body.topP ?? 1.0,
        contextWindow: body.contextWindow ?? 8000,
        memoryEnabled: body.memoryEnabled ?? true,
        memorySize: body.memorySize ?? 50,
        allowEditing: body.allowEditing ?? true,
        requireApproval: body.requireApproval ?? false,
        category: body.category,
        keywords: body.keywords || [],
        projectGoals: body.projectGoals,
        expectedOutcome: body.expectedOutcome,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
        version: 1
      },
      include: {
        lastEditor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(context);
  } catch (error) {
    console.error('Failed to create thread context:', error);
    return NextResponse.json(
      { error: 'Failed to create thread context' },
      { status: 500 }
    );
  }
}