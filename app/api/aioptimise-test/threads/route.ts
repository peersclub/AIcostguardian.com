import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Mock threads for testing
const mockThreads = [
  {
    id: 'thread-1',
    title: 'Product Strategy Discussion',
    lastMessageAt: new Date().toISOString(),
    messageCount: 5,
    totalCost: 0.0023,
    isPinned: true,
    isArchived: false,
    tags: ['strategy', 'product'],
    isShared: true,
    collaborators: ['alice@example.com', 'bob@example.com'],
    mode: 'standard',
    isLive: true,
    hasError: false,
  },
  {
    id: 'thread-2',
    title: 'Code Review: Authentication Module',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    messageCount: 12,
    totalCost: 0.0045,
    isPinned: false,
    isArchived: false,
    tags: ['code', 'review'],
    isShared: false,
    collaborators: [],
    mode: 'coding',
    isLive: false,
    hasError: false,
  },
  {
    id: 'thread-3',
    title: 'Market Research Analysis',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    messageCount: 8,
    totalCost: 0.0034,
    isPinned: false,
    isArchived: false,
    tags: ['research'],
    isShared: false,
    collaborators: [],
    mode: 'research',
    isLive: false,
    hasError: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json({ threads: mockThreads });
  } catch (error) {
    console.error('Failed to fetch threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title = 'New Chat', mode = 'standard' } = body;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newThread = {
      id: `thread-${Date.now()}`,
      title,
      lastMessageAt: new Date().toISOString(),
      messageCount: 0,
      totalCost: 0,
      isPinned: false,
      isArchived: false,
      tags: [],
      isShared: false,
      collaborators: [],
      mode,
      isLive: false,
      hasError: false,
    };
    
    mockThreads.unshift(newThread);
    
    return NextResponse.json(newThread);
  } catch (error) {
    console.error('Failed to create thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}