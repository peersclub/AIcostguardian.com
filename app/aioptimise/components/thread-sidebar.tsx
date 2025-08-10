'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare,
  Pin,
  Archive,
  Search,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Thread {
  id: string;
  title: string;
  lastMessageAt: string | null;
  messageCount: number;
  totalCost: number;
  isPinned: boolean;
  isArchived: boolean;
}

interface ThreadSidebarProps {
  threads: Thread[];
  currentThread: Thread | null;
  collapsed: boolean;
  onToggle: () => void;
  onNewThread: () => void;
  onSelectThread: (threadId: string) => void;
}

export function ThreadSidebar({
  threads,
  currentThread,
  collapsed,
  onToggle,
  onNewThread,
  onSelectThread,
}: ThreadSidebarProps) {
  const pinnedThreads = threads.filter(t => t.isPinned && !t.isArchived);
  const regularThreads = threads.filter(t => !t.isPinned && !t.isArchived);
  
  if (collapsed) {
    return (
      <div className="w-16 border-r flex flex-col items-center py-4 gap-2">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewThread}>
          <Plus className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon">
          <Archive className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-80 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Threads</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onNewThread}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            className="pl-8"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {pinnedThreads.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Pinned
              </div>
              {pinnedThreads.map(thread => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isActive={currentThread?.id === thread.id}
                  onClick={() => onSelectThread(thread.id)}
                />
              ))}
            </>
          )}
          
          {regularThreads.length > 0 && (
            <>
              {pinnedThreads.length > 0 && (
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">
                  Recent
                </div>
              )}
              {regularThreads.map(thread => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isActive={currentThread?.id === thread.id}
                  onClick={() => onSelectThread(thread.id)}
                />
              ))}
            </>
          )}
          
          {threads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No threads yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Archive className="h-4 w-4 mr-2" />
          Archived Threads
        </Button>
      </div>
    </div>
  );
}

function ThreadItem({
  thread,
  isActive,
  onClick,
}: {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors mb-1",
        "hover:bg-accent",
        isActive && "bg-accent"
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="font-medium text-sm truncate flex-1">
          {thread.title}
        </span>
        {thread.isPinned && (
          <Pin className="h-3 w-3 text-muted-foreground ml-1" />
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{thread.messageCount} messages</span>
          <span>·</span>
          <span>${thread.totalCost.toFixed(3)}</span>
        </div>
        {thread.lastMessageAt && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}