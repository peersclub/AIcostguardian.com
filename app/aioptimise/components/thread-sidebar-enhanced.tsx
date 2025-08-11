'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Archive, 
  Pin, 
  MoreVertical,
  MessageSquare,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Users,
  Hash,
  Trash2,
  Edit,
  Share2,
  Download,
  Filter,
  SortAsc,
  Star,
  Circle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  lastMessageAt: string | null;
  messageCount: number;
  totalCost: number;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  mode?: 'standard' | 'focus' | 'coding' | 'research' | 'creative';
  hasUnread?: boolean;
  isShared?: boolean;
  collaborators?: string[];
  isLive?: boolean;
  hasError?: boolean;
}

interface ThreadSidebarEnhancedProps {
  threads: Thread[];
  currentThread: Thread | null;
  collapsed: boolean;
  onToggle: () => void;
  onNewThread: () => void;
  onSelectThread: (threadId: string) => void;
  onArchiveThread?: (threadId: string) => void;
  onPinThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  onShareThread?: (threadId: string) => void;
  organizationName?: string;
}

export function ThreadSidebarEnhanced({
  threads,
  currentThread,
  collapsed,
  onToggle,
  onNewThread,
  onSelectThread,
  onArchiveThread,
  onPinThread,
  onDeleteThread,
  onShareThread,
  organizationName = "Your Organization",
}: ThreadSidebarEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'shared' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'cost' | 'messages'>('recent');

  // Filter and sort threads
  const filteredThreads = threads
    .filter(thread => {
      if (filterMode === 'pinned' && !thread.isPinned) return false;
      if (filterMode === 'archived' && !thread.isArchived) return false;
      if (filterMode === 'shared' && !thread.isShared) return false;
      if (searchQuery && !thread.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return b.totalCost - a.totalCost;
        case 'messages':
          return b.messageCount - a.messageCount;
        default:
          return new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime();
      }
    });

  // Group threads by date
  const groupedThreads = filteredThreads.reduce((acc, thread) => {
    const date = thread.lastMessageAt ? new Date(thread.lastMessageAt) : new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let group = 'Older';
    if (date.toDateString() === today.toDateString()) {
      group = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      group = 'This Week';
    }
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(thread);
    return acc;
  }, {} as Record<string, Thread[]>);

  const getModeIcon = (mode?: string) => {
    switch (mode) {
      case 'focus': return '🎯';
      case 'coding': return '💻';
      case 'research': return '🔬';
      case 'creative': return '🎨';
      default: return null;
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 transition-all duration-300",
        collapsed ? "w-16" : "w-80"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            {!collapsed && (
              <h2 className="font-semibold text-sm text-white">Chat History</h2>
            )}
          </div>
          {!collapsed && (
            <Button
              onClick={onNewThread}
              size="sm"
              className="h-8 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          )}
        </div>

        {/* Search and filters */}
        {!collapsed && (
          <>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="pl-8 h-8 text-sm bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="flex gap-1">
              <Button
                variant={filterMode === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('all')}
                className="h-7 text-xs"
              >
                All
              </Button>
              <Button
                variant={filterMode === 'pinned' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('pinned')}
                className="h-7 text-xs"
              >
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Button>
              <Button
                variant={filterMode === 'shared' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('shared')}
                className="h-7 text-xs"
              >
                <Users className="h-3 w-3 mr-1" />
                Shared
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <SortAsc className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('recent')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('cost')}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cost
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('messages')}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>

      {/* Threads list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {collapsed ? (
            // Collapsed view - show icons only
            <div className="space-y-2">
              {filteredThreads.slice(0, 10).map((thread) => (
                <Button
                  key={thread.id}
                  variant={currentThread?.id === thread.id ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => onSelectThread(thread.id)}
                  className="w-full h-12 relative"
                >
                  <div className="relative">
                    {getModeIcon(thread.mode) || <MessageSquare className="h-4 w-4" />}
                    {thread.isLive && (
                      <Circle className="absolute -top-1 -right-1 h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
                    )}
                    {thread.hasError && (
                      <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            // Expanded view - show full thread info
            <div className="space-y-4">
              {Object.entries(groupedThreads).map(([group, groupThreads]) => (
                <div key={group}>
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    {group}
                  </div>
                  <div className="space-y-1">
                    {groupThreads.map((thread) => (
                      <div
                        key={thread.id}
                        className={cn(
                          "group relative rounded-lg p-2 hover:bg-muted/50 cursor-pointer transition-all duration-200",
                          currentThread?.id === thread.id && "bg-muted"
                        )}
                        onClick={() => onSelectThread(thread.id)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {thread.isPinned && (
                              <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                            {getModeIcon(thread.mode) && (
                              <span className="text-xs">{getModeIcon(thread.mode)}</span>
                            )}
                            <span className="text-sm font-medium truncate">
                              {thread.title}
                            </span>
                            {thread.isLive && (
                              <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse flex-shrink-0" />
                            )}
                            {thread.hasError && (
                              <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onPinThread?.(thread.id)}>
                                <Pin className="h-4 w-4 mr-2" />
                                {thread.isPinned ? 'Unpin' : 'Pin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onArchiveThread?.(thread.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onShareThread?.(thread.id)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {}}>
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {}}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteThread?.(thread.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {thread.messageCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${thread.totalCost.toFixed(3)}
                          </span>
                          {thread.lastMessageAt && (
                            <span className="truncate">
                              {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        
                        {thread.tags && thread.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {thread.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="h-5 text-[10px] px-1">
                                <Hash className="h-2 w-2 mr-0.5" />
                                {tag}
                              </Badge>
                            ))}
                            {thread.tags.length > 3 && (
                              <Badge variant="outline" className="h-5 text-[10px] px-1">
                                +{thread.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {thread.isShared && thread.collaborators && thread.collaborators.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              Shared with {thread.collaborators.length} {thread.collaborators.length === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - Organization disclaimer */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            All chats belong to
            <span className="font-medium text-foreground ml-1">
              {organizationName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}