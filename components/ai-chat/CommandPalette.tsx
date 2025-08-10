'use client';

import React from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Plus,
  MessageSquare,
  Trash2,
  Download,
  Settings,
  History,
  BarChart3,
  Keyboard,
  Moon,
  Sun
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  conversations?: any[];
  onSelectConversation?: (conversation: any) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNewChat,
  onToggleSidebar,
  onClearChat,
  onExportChat,
  conversations = [],
  onSelectConversation
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={onNewChat}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </CommandItem>
          <CommandItem onSelect={onToggleSidebar}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Toggle Sidebar
          </CommandItem>
          <CommandItem onSelect={onClearChat}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Current Chat
          </CommandItem>
          <CommandItem onSelect={onExportChat}>
            <Download className="mr-2 h-4 w-4" />
            Export Chat
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => window.location.href = '/dashboard'}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => window.location.href = '/settings'}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          <CommandItem onSelect={() => window.location.href = '/analytics/usage'}>
            <History className="mr-2 h-4 w-4" />
            Usage History
          </CommandItem>
        </CommandGroup>

        {conversations.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Conversations">
              {conversations.slice(0, 5).map((conv) => (
                <CommandItem
                  key={conv.id}
                  onSelect={() => onSelectConversation?.(conv)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <div className="flex-1 truncate">
                    <span className="font-medium">{conv.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Keyboard Shortcuts">
          <CommandItem>
            <Keyboard className="mr-2 h-4 w-4" />
            <span className="flex-1">Command Palette</span>
            <kbd className="text-xs">⌘K</kbd>
          </CommandItem>
          <CommandItem>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="flex-1">Toggle Sidebar</span>
            <kbd className="text-xs">⌘/</kbd>
          </CommandItem>
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span className="flex-1">New Chat</span>
            <kbd className="text-xs">⌘N</kbd>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}