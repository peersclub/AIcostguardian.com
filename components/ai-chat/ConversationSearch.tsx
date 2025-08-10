'use client';

import React, { useState, useMemo } from 'react';
import { Search, MessageSquare, Calendar, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: any[];
  totalCost?: number;
  totalTokens?: number;
}

interface ConversationSearchProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  className?: string;
}

export function ConversationSearch({
  conversations,
  onSelectConversation,
  className
}: ConversationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = searchQuery === '' || 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some(msg => 
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSearch;
    });
  }, [conversations, searchQuery]);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const groups: Record<string, Conversation[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    filteredConversations.forEach(conv => {
      const convDate = new Date(conv.timestamp);
      let groupKey: string;

      if (convDate.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (convDate.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (convDate > lastWeek) {
        groupKey = 'This Week';
      } else {
        groupKey = convDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conv);
    });

    return groups;
  }, [filteredConversations]);

  const formatCost = (cost?: number): string => {
    if (!cost) return '';
    if (cost < 0.001) return `$${(cost * 1000).toFixed(4)}m`;
    if (cost < 0.01) return `$${cost.toFixed(5)}`;
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-3"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant={selectedTag === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedTag(null)}
        >
          All
        </Badge>
        <Badge
          variant={selectedTag === 'today' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedTag('today')}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Today
        </Badge>
        <Badge
          variant={selectedTag === 'high-cost' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedTag('high-cost')}
        >
          <Hash className="h-3 w-3 mr-1" />
          High Cost
        </Badge>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="text-xs text-muted-foreground">
          Found {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Grouped Conversations */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {Object.entries(groupedConversations).map(([group, convs]) => (
            <div key={group}>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {group}
              </p>
              <div className="space-y-1">
                {convs.map(conv => (
                  <Button
                    key={conv.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => onSelectConversation(conv)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex-1 truncate">
                      <p className="font-medium text-sm truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.timestamp).toLocaleTimeString()}
                        </span>
                        {conv.totalCost && (
                          <span className="text-xs text-green-600">
                            {formatCost(conv.totalCost)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}