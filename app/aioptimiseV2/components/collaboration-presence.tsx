'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Users,
  Circle,
  Edit3,
  Eye,
  MessageSquare,
  MousePointer,
  Wifi,
  WifiOff,
  Crown,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CollaboratorPresence {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  status: 'active' | 'idle' | 'typing';
  cursorPosition?: { x: number; y: number };
  lastSeen: Date;
  color: string;
  isTyping?: boolean;
  typingMessage?: string;
}

interface CollaborationPresenceProps {
  threadId: string;
  currentUserId: string;
  collaborators: CollaboratorPresence[];
  isConnected: boolean;
  onReconnect?: () => void;
  className?: string;
  showDetails?: boolean;
  maxVisible?: number;
}

export function CollaborationPresence({
  threadId,
  currentUserId,
  collaborators = [],
  isConnected,
  onReconnect,
  className,
  showDetails = true,
  maxVisible = 5,
}: CollaborationPresenceProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Filter out current user and sort by activity
  const activeCollaborators = collaborators
    .filter(c => c.userId !== currentUserId && c.status !== 'idle')
    .sort((a, b) => {
      if (a.status === 'typing' && b.status !== 'typing') return -1;
      if (b.status === 'typing' && a.status !== 'typing') return 1;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });

  const visibleCollaborators = activeCollaborators.slice(0, maxVisible);
  const hiddenCount = Math.max(0, activeCollaborators.length - maxVisible);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'typing':
        return <MessageSquare className="h-3 w-3 animate-pulse" />;
      case 'active':
        return <Circle className="h-2 w-2 fill-current" />;
      default:
        return null;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-3 w-3" />;
      case 'EDITOR':
        return <Edit3 className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'typing':
        return 'text-blue-500';
      case 'active':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  if (!isConnected && showDetails) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <WifiOff className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Offline</span>
        {onReconnect && (
          <Button
            onClick={onReconnect}
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
          >
            Reconnect
          </Button>
        )}
      </div>
    );
  }

  if (activeCollaborators.length === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">No one else here</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {isConnected && (
          <Wifi className="h-4 w-4 text-green-500" />
        )}
        
        <div className="flex -space-x-2">
          {visibleCollaborators.map((collaborator) => (
            <Tooltip key={collaborator.id}>
              <TooltipTrigger asChild>
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredUser(collaborator.userId)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8 border-2 transition-all",
                      "hover:z-10 hover:scale-110",
                      collaborator.status === 'typing' 
                        ? "border-blue-500 ring-2 ring-blue-500/30"
                        : "border-background"
                    )}
                    style={{
                      borderColor: hoveredUser === collaborator.userId 
                        ? collaborator.color 
                        : undefined
                    }}
                  >
                    <AvatarImage src={collaborator.image} />
                    <AvatarFallback
                      className="text-xs"
                      style={{ backgroundColor: `${collaborator.color}20` }}
                    >
                      {collaborator.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {collaborator.status && (
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 p-0.5 bg-background rounded-full",
                        getStatusColor(collaborator.status)
                      )}
                    >
                      {getStatusIcon(collaborator.status)}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-card border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {collaborator.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getRoleIcon(collaborator.role)}
                      <span className="ml-1">{collaborator.role}</span>
                    </Badge>
                  </div>
                  {collaborator.isTyping && collaborator.typingMessage && (
                    <p className="text-xs text-blue-500">
                      Typing: {collaborator.typingMessage}...
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Last seen {formatDistanceToNow(new Date(collaborator.lastSeen))} ago
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {hiddenCount > 0 && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full p-0 border-border"
              >
                <span className="text-xs">+{hiddenCount}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card border-border" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    Active Collaborators
                  </h4>
                  <Badge variant="outline">
                    {activeCollaborators.length} online
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeCollaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.image} />
                        <AvatarFallback className="text-xs">
                          {collaborator.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {collaborator.name}
                          </span>
                          <div className={cn("flex items-center", getStatusColor(collaborator.status))}>
                            {getStatusIcon(collaborator.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {collaborator.role}
                          </span>
                          {collaborator.isTyping && (
                            <span className="text-xs text-blue-500">
                              Typing...
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDistanceToNow(new Date(collaborator.lastSeen), { addSuffix: false })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {showDetails && activeCollaborators.length > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            {activeCollaborators.filter(c => c.status === 'typing').length > 0 && (
              <span className="text-blue-500">
                {activeCollaborators.filter(c => c.status === 'typing').length} typing
              </span>
            )}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}

// Typing indicator component
export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {users.length === 1 
          ? `${users[0]} is typing...`
          : users.length === 2
          ? `${users[0]} and ${users[1]} are typing...`
          : `${users[0]} and ${users.length - 1} others are typing...`
        }
      </span>
    </div>
  );
}

// Cursor component for showing remote cursors
export function RemoteCursor({
  user,
  position,
  color,
}: {
  user: string;
  position: { x: number; y: number };
  color: string;
}) {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-100"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <MousePointer
        className="h-4 w-4"
        style={{ color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      />
      <div
        className="absolute top-4 left-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {user}
      </div>
    </div>
  );
}