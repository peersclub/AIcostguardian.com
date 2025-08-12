import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export interface CreateThreadDto {
  title: string;
  userId: string;
  organizationId?: string;
  mode?: 'STANDARD' | 'FOCUS' | 'CODING' | 'RESEARCH' | 'CREATIVE';
  metadata?: any;
}

export interface ShareOptions {
  expiresAt?: Date;
  allowEdit?: boolean;
  requireAuth?: boolean;
  maxCollaborators?: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
  includeShared?: boolean;
  sortBy?: 'created' | 'updated' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  search?: string;
  mode?: string;
}

export interface Thread {
  id: string;
  title: string;
  userId: string;
  organizationId?: string;
  isPinned: boolean;
  isShared: boolean;
  shareToken?: string;
  isArchived?: boolean;
  mode: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
  lastMessage?: any;
  collaborators?: any[];
}

export interface Collaborator {
  id: string;
  threadId: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  invitedAt: Date;
  invitedBy: string;
  acceptedAt?: Date | null;
  lastViewedAt?: Date | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
}

export interface Activity {
  id: string;
  threadId: string;
  userId?: string;
  action: string;
  metadata?: any;
  createdAt: Date;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

export class ThreadManager {
  // Core Thread Operations
  async createThread(data: CreateThreadDto): Promise<Thread> {
    const thread = await prisma.aIThread.create({
      data: {
        id: nanoid(),
        title: data.title,
        userId: data.userId,
        organizationId: data.organizationId,
        mode: data.mode || 'STANDARD',
        metadata: data.metadata || {},
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // Log activity - disabled (threadActivity model not in schema)
    // await this.logActivity(thread.id, 'created', data.userId, {
    //   title: data.title,
    //   mode: data.mode
    // });

    return this.formatThread(thread);
  }

  async deleteThread(threadId: string, userId: string): Promise<void> {
    // Soft delete
    await prisma.aIThread.update({
      where: { id: threadId },
      data: { isArchived: true }
    });

    // await this.logActivity(threadId, 'deleted', userId);
  }

  async restoreThread(threadId: string, userId: string): Promise<Thread> {
    const thread = await prisma.aIThread.update({
      where: { id: threadId },
      data: { isArchived: false },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // await this.logActivity(threadId, 'restored', userId);
    return this.formatThread(thread);
  }

  async pinThread(threadId: string, userId: string): Promise<Thread> {
    const thread = await prisma.aIThread.update({
      where: { id: threadId },
      data: { isPinned: true },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // await this.logActivity(threadId, 'pinned', userId);
    return this.formatThread(thread);
  }

  async unpinThread(threadId: string, userId: string): Promise<Thread> {
    const thread = await prisma.aIThread.update({
      where: { id: threadId },
      data: { isPinned: false },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // await this.logActivity(threadId, 'unpinned', userId);
    return this.formatThread(thread);
  }

  // Sharing Operations
  async shareThread(threadId: string, userId: string, options: ShareOptions = {}): Promise<{
    thread: Thread;
    shareUrl: string;
  }> {
    const shareId = this.generateShareToken();
    
    const thread = await prisma.aIThread.update({
      where: { id: threadId },
      data: {
        shareId,
        metadata: {
          ...options,
          sharedAt: new Date(),
          sharedBy: userId
        }
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // await this.logActivity(threadId, 'shared', userId, {
    //   shareId,
    //   options
    // });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/aioptimise/shared/${shareId}`;
    
    return {
      thread: this.formatThread(thread),
      shareUrl
    };
  }

  async unshareThread(threadId: string, userId: string): Promise<void> {
    await prisma.aIThread.update({
      where: { id: threadId },
      data: {
        shareId: null
      }
    });

    // Remove all collaborators
    await prisma.threadCollaborator.deleteMany({
      where: { threadId }
    });

    // await this.logActivity(threadId, 'unshared', userId);
  }

  async addCollaborator(
    threadId: string,
    email: string,
    role: 'VIEWER' | 'EDITOR' = 'VIEWER',
    addedBy: string
  ): Promise<void> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    await prisma.threadCollaborator.create({
      data: {
        threadId,
        userId: user.id,
        role,
        invitedBy: addedBy
      }
    });

    // await this.logActivity(threadId, 'collaborator_added', addedBy, {
    //   email,
    //   role,
    //   userId: user.id
    // });
  }

  async removeCollaborator(threadId: string, collaboratorId: string, removedBy: string): Promise<void> {
    const collaborator = await prisma.threadCollaborator.findUnique({
      where: { id: collaboratorId }
    });

    if (collaborator) {
      await prisma.threadCollaborator.delete({
        where: { id: collaboratorId }
      });

      // await this.logActivity(threadId, 'collaborator_removed', removedBy, {
      //   userId: collaborator.userId
      // });
    }
  }

  async getCollaborators(threadId: string): Promise<Collaborator[]> {
    const collaborators = await prisma.threadCollaborator.findMany({
      where: { threadId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { invitedAt: 'asc' }
    });

    return collaborators as Collaborator[];
  }

  // Query Operations
  async getUserThreads(userId: string, options: QueryOptions = {}): Promise<Thread[]> {
    const where: any = {
      OR: [
        { userId },
        {
          collaborators: {
            some: { userId }
          }
        }
      ]
    };

    if (!options.includeDeleted) {
      where.isArchived = false;
    }

    if (options.search) {
      where.title = {
        contains: options.search,
        mode: 'insensitive'
      };
    }

    if (options.mode) {
      where.mode = options.mode;
    }

    const threads = await prisma.aIThread.findMany({
      where,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        [options.sortBy || 'updatedAt']: options.sortOrder || 'desc'
      },
      take: options.limit || 50,
      skip: options.offset || 0
    });

    return threads.map(this.formatThread);
  }

  async getSharedThreads(userId: string): Promise<Thread[]> {
    const threads = await prisma.aIThread.findMany({
      where: {
        collaborators: {
          some: { userId }
        },
        isArchived: false
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return threads.map(this.formatThread);
  }

  async getPinnedThreads(userId: string): Promise<Thread[]> {
    const threads = await prisma.aIThread.findMany({
      where: {
        userId,
        isPinned: true,
        isArchived: false
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return threads.map(this.formatThread);
  }

  async getThreadByShareToken(token: string): Promise<Thread | null> {
    const thread = await prisma.aIThread.findUnique({
      where: { shareId: token },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { messages: true }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        collaborators: {
          include: {
            user: {
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

    return thread ? this.formatThread(thread) : null;
  }

  async updateThreadMode(threadId: string, mode: string, userId: string): Promise<Thread> {
    const thread = await prisma.aIThread.update({
      where: { id: threadId },
      data: { mode: mode as 'STANDARD' | 'FOCUS' | 'CODING' | 'RESEARCH' | 'CREATIVE' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // await this.logActivity(threadId, 'edited', userId, {
    //   field: 'mode',
    //   oldValue: thread.mode,
    //   newValue: mode
    // });

    return this.formatThread(thread);
  }

  async updateThreadSettings(threadId: string, metadata: any, userId: string): Promise<Thread> {
    const thread = await prisma.aIThread.update({
      where: { id: threadId },
      data: { metadata },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // await this.logActivity(threadId, 'edited', userId, {
    //   field: 'settings',
    //   settings: metadata
    // });

    return this.formatThread(thread);
  }

  // Activity Tracking - disabled (threadActivity model not in schema)
  async logActivity(
    threadId: string,
    action: string,
    userId?: string,
    metadata?: any
  ): Promise<void> {
    // await prisma.threadActivity.create({
    //   data: {
    //     threadId,
    //     userId,
    //     action,
    //     metadata: metadata || {}
    //   }
    // });
    console.log('Activity log (disabled):', { threadId, action, userId });
  }

  async getActivityLog(threadId: string, limit: number = 50): Promise<Activity[]> {
    // threadActivity model not in schema - returning empty array
    // const activities = await prisma.threadActivity.findMany({
    //   where: { threadId },
    //   include: {
    //     user: {
    //       select: {
    //         name: true,
    //         email: true,
    //         image: true
    //       }
    //     }
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit
    // });
    // return activities as Activity[];
    return [];
  }

  // Utility Methods
  private generateShareToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private formatThread(thread: any): Thread {
    return {
      id: thread.id,
      title: thread.title,
      userId: thread.userId,
      organizationId: thread.organizationId,
      isPinned: thread.isPinned || false,
      isShared: !!thread.shareId,
      shareToken: thread.shareId,
      isArchived: thread.isArchived || false,
      mode: thread.mode || 'STANDARD',
      metadata: thread.metadata || {},
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      messageCount: thread._count?.messages || 0,
      lastMessage: thread.messages?.[0],
      collaborators: thread.collaborators
    };
  }

  // Bulk Operations
  async bulkDelete(threadIds: string[], userId: string): Promise<void> {
    await prisma.aIThread.updateMany({
      where: {
        id: { in: threadIds },
        userId
      },
      data: { isArchived: true }
    });

    // Log activities
    for (const threadId of threadIds) {
      // await this.logActivity(threadId, 'deleted', userId);
    }
  }

  async bulkPin(threadIds: string[], userId: string): Promise<void> {
    await prisma.aIThread.updateMany({
      where: {
        id: { in: threadIds },
        userId
      },
      data: { isPinned: true }
    });

    for (const threadId of threadIds) {
      // await this.logActivity(threadId, 'pinned', userId);
    }
  }

  async bulkUnpin(threadIds: string[], userId: string): Promise<void> {
    await prisma.aIThread.updateMany({
      where: {
        id: { in: threadIds },
        userId
      },
      data: { isPinned: false }
    });

    for (const threadId of threadIds) {
      // await this.logActivity(threadId, 'unpinned', userId);
    }
  }

  // Search and Filter
  async searchThreads(userId: string, query: string): Promise<Thread[]> {
    const threads = await prisma.aIThread.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId },
              {
                collaborators: {
                  some: { userId }
                }
              }
            ]
          },
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                messages: {
                  some: {
                    content: {
                      contains: query,
                      mode: 'insensitive'
                    }
                  }
                }
              }
            ]
          },
          { isArchived: false }
        ]
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    return threads.map(this.formatThread);
  }
}

// Export singleton instance
export const threadManager = new ThreadManager();