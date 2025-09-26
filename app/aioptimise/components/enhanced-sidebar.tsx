'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare, FileText, Star, Globe, Settings, Plus, Search,
  ChevronDown, ChevronRight, Users, Headphones, Archive, Bell,
  Clock, Hash, User, Bot, ExternalLink, AlertTriangle, Edit, MoreVertical, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from 'next-auth/react'
import { ThreadCreationDialog } from './thread-creation-dialog'
import { ThreadManagementDialog } from './thread-management-dialog'
import { toast } from 'sonner'

interface Thread {
  id: string
  title: string
  description?: string
  isArchived: boolean
  isPinned: boolean
  isStarred: boolean
  threadType: 'STANDARD' | 'DIRECT' | 'CHANNEL' | 'HUDDLE' | 'EXTERNAL' | 'PROJECT'
  hasExternalUsers: boolean
  lastMessageAt?: string
  messageCount: number
  totalCost: number
  sharedWithEmails: string[]
  collaborators?: any[]
}

interface Draft {
  id: string
  content: string
  threadId?: string
  createdAt: string
  updatedAt: string
  reminderAt?: string
}

interface EnhancedSidebarProps {
  threads: Thread[]
  drafts: Draft[]
  currentThread?: Thread
  isOpen: boolean
  isLoading?: boolean
  onThreadSelect: (threadId: string) => void
  onCreateThread: () => void
  onCreateThreadType?: (threadType: string, title?: string) => void
  onToggleStar: (threadId: string) => void
  organizationMembers: any[]
  className?: string
  onUpdateThread?: (threadId: string, updates: any) => Promise<void>
  onInviteMember?: (threadId: string, memberId: string, role: string) => Promise<void>
  onRemoveMember?: (threadId: string, memberId: string) => Promise<void>
  onArchiveThread?: (threadId: string) => Promise<void>
  onDeleteThread?: (threadId: string) => Promise<void>
}

export function EnhancedSidebar({
  threads,
  drafts,
  currentThread,
  isOpen,
  isLoading = false,
  onThreadSelect,
  onCreateThread,
  onCreateThreadType,
  onToggleStar,
  organizationMembers,
  className,
  onUpdateThread,
  onInviteMember,
  onRemoveMember,
  onArchiveThread,
  onDeleteThread
}: EnhancedSidebarProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    threads: false,
    drafts: false,
    starred: false,
    external: false,
    channels: false,
    direct: false,
    huddles: false
  })

  // Dialog state management
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showManageDialog, setShowManageDialog] = useState(false)
  const [selectedThreadForManagement, setSelectedThreadForManagement] = useState<Thread | null>(null)

  // Optimized filtering with useMemo to prevent unnecessary re-computations
  const categorizedThreads = useMemo(() => {
    // Filter out empty threads, duplicates, and organize properly
    const validThreads = threads.filter(t => 
      !t.isArchived && 
      t.title && 
      t.title.trim() !== '' && 
      !t.title.includes('New Project Set') && // Remove empty/placeholder threads
      !t.title.includes('Untitled') && // Remove untitled threads
      !t.title.startsWith('Thread') && // Remove generic thread names
      t.title.length > 3 // Ensure meaningful titles
    )

    // Remove duplicates by title (keep the most recent one)
    const uniqueThreads = validThreads.reduce((acc, thread) => {
      const existing = acc.find(t => t.title === thread.title)
      if (!existing || (thread.lastMessageAt && (!existing.lastMessageAt || thread.lastMessageAt > existing.lastMessageAt))) {
        return [...acc.filter(t => t.title !== thread.title), thread]
      }
      return acc
    }, [] as Thread[])

    const active = uniqueThreads.filter(t => t.threadType === 'STANDARD' && t.messageCount > 0)
    const starred = uniqueThreads.filter(t => t.isStarred)
    const recent = uniqueThreads
      .filter(t => t.lastMessageAt)
      .sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime())
      .slice(0, 8) // Show more recent threads
    const channels = uniqueThreads.filter(t => t.threadType === 'CHANNEL')
    const direct = uniqueThreads.filter(t => t.threadType === 'DIRECT')
    const huddles = uniqueThreads.filter(t => t.threadType === 'HUDDLE')
    const external = uniqueThreads.filter(t => t.hasExternalUsers)

    return { active, starred, recent, channels, direct, huddles, external }
  }, [threads])

  // Search filtering with debouncing effect
  const filteredThreads = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return categorizedThreads

    const filterByQuery = (threadList: Thread[]) =>
      threadList.filter(t => t.title.toLowerCase().includes(query))

    return {
      active: filterByQuery(categorizedThreads.active),
      starred: filterByQuery(categorizedThreads.starred),
      recent: filterByQuery(categorizedThreads.recent),
      external: filterByQuery(categorizedThreads.external),
      channels: filterByQuery(categorizedThreads.channels),
      direct: filterByQuery(categorizedThreads.direct),
      huddles: filterByQuery(categorizedThreads.huddles)
    }
  }, [categorizedThreads, searchQuery])

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }, [])

  // Enhanced thread creation with dialog
  const handleCreateThreadWithDialog = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/aioptimise/threads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const newThread = await response.json()
        toast.success(`${data.threadType === 'CHANNEL' ? 'Channel' : 'Thread'} created successfully`)
        onThreadSelect(newThread.id)
        // Trigger refresh of threads list
        window.location.reload()
      } else {
        throw new Error('Failed to create thread')
      }
    } catch (error) {
      toast.error('Failed to create thread')
      throw error
    }
  }, [onThreadSelect])

  // Thread management handlers
  const handleManageThread = useCallback((thread: Thread) => {
    setSelectedThreadForManagement(thread)
    setShowManageDialog(true)
  }, [])

  const handleUpdateThread = useCallback(async (threadId: string, updates: any) => {
    if (onUpdateThread) {
      await onUpdateThread(threadId, updates)
    }
  }, [onUpdateThread])

  const handleInviteMember = useCallback(async (threadId: string, memberId: string, role: string) => {
    if (onInviteMember) {
      await onInviteMember(threadId, memberId, role)
    }
  }, [onInviteMember])

  const handleRemoveMember = useCallback(async (threadId: string, memberId: string) => {
    if (onRemoveMember) {
      await onRemoveMember(threadId, memberId)
    }
  }, [onRemoveMember])

  const handleArchiveThread = useCallback(async (threadId: string) => {
    if (onArchiveThread) {
      await onArchiveThread(threadId)
    }
  }, [onArchiveThread])

  const handleDeleteThread = useCallback(async (threadId: string) => {
    if (onDeleteThread) {
      await onDeleteThread(threadId)
    }
  }, [onDeleteThread])

  const getThreadIcon = (thread: Thread) => {
    switch (thread.threadType) {
      case 'DIRECT':
        return <User className="w-4 h-4" />
      case 'CHANNEL':
        return <Hash className="w-4 h-4" />
      case 'HUDDLE':
        return <Headphones className="w-4 h-4" />
      case 'EXTERNAL':
        return <ExternalLink className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  // Loading skeleton component
  const LoadingSkeletons = ({ count = 3 }: { count?: number }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg animate-pulse">
          <div className="w-4 h-4 bg-gray-600 rounded" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-600 rounded w-3/4" />
            <div className="h-2 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  )

  const SidebarSection = ({
    title,
    icon,
    count,
    isCollapsed,
    onToggle,
    children,
    className: sectionClassName
  }: {
    title: string
    icon: React.ReactNode
    count?: number
    isCollapsed: boolean
    onToggle: () => void
    children: React.ReactNode
    className?: string
  }) => (
    <div className={cn("mb-4", sectionClassName)}>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-2 hover:bg-gray-800/50 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
          {icon}
          <span className="text-sm font-medium text-gray-300">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="ml-auto bg-gray-700 text-gray-300 text-xs">
              {count}
            </Badge>
          )}
        </div>
      </button>
      <div
        className={cn(
          "ml-6 transition-all duration-200 ease-in-out",
          isCollapsed ? "max-h-0 opacity-0 overflow-hidden" : "max-h-96 opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  )

  const ThreadItem = ({ thread }: { thread: Thread }) => (
    <div
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-800/50",
        currentThread?.id === thread.id && "bg-indigo-950/20 border border-indigo-500/30"
      )}
      onClick={() => onThreadSelect(thread.id)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getThreadIcon(thread)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white truncate font-medium">
              {thread.title}
            </span>
            {thread.hasExternalUsers && (
              <ExternalLink className="w-3 h-3 text-amber-400" />
            )}
            {thread.isPinned && (
              <Archive className="w-3 h-3 text-blue-400" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{thread.messageCount} messages</span>
            {thread.lastMessageAt && (
              <span>• {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onToggleStar(thread.id)
          }}
          className="h-6 w-6 p-0"
        >
          <Star
            className={cn(
              "w-3 h-3",
              thread.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            )}
          />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <MoreVertical className="w-3 h-3 text-gray-300 hover:text-white transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-gray-800/50 backdrop-blur-xl border-gray-600 text-white">
            <DropdownMenuItem
              className="text-white hover:bg-gray-700/50 focus:bg-gray-700/50"
              onClick={() => handleManageThread(thread)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit thread
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-white hover:bg-gray-700/50 focus:bg-gray-700/50"
              onClick={() => handleManageThread(thread)}
            >
              <Users className="w-4 h-4 mr-2" />
              Invite members
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-white hover:bg-gray-700/50 focus:bg-gray-700/50"
              onClick={() => handleArchiveThread(thread.id)}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
              onClick={() => handleDeleteThread(thread.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete thread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const DraftItem = ({ draft }: { draft: Draft }) => (
    <div className="group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-800/50">
      <FileText className="w-4 h-4 text-orange-400" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white truncate">
          {draft.content.length > 30 ? `${draft.content.substring(0, 30)}...` : draft.content}
        </span>
        <div className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
          {draft.reminderAt && (
            <span className="ml-2 text-amber-400">
              <Bell className="w-3 h-3 inline mr-1" />
              Reminder set
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 flex flex-col h-full transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      {/* Header with User Profile */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>
                {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                {session?.user?.name || 'AIOptimise V2'}
              </h2>
              <p className="text-xs text-gray-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800/50 backdrop-blur-xl border-gray-600 text-white">
              <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Create New Thread
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCreateThreadType?.('DIRECT', 'Direct Message')}>
                <User className="w-4 h-4 mr-2" />
                Quick Direct Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateThreadType?.('CHANNEL', 'New Channel')}>
                <Hash className="w-4 h-4 mr-2" />
                Quick Channel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateThreadType?.('HUDDLE', 'Team Huddle')}>
                <Headphones className="w-4 h-4 mr-2" />
                Quick Huddle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateThreadType?.('EXTERNAL', 'External Collaboration')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Quick External
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-9 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Recent Activity Section */}
        {filteredThreads.recent.length > 0 && (
          <SidebarSection
            title="Recent"
            icon={<Clock className="w-4 h-4 text-green-400" />}
            count={filteredThreads.recent.length}
            isCollapsed={collapsedSections.recent || false}
            onToggle={() => toggleSection('recent')}
          >
            <div className="space-y-1">
              {isLoading ? (
                <LoadingSkeletons count={2} />
              ) : (
                filteredThreads.recent.map((thread) => (
                  <ThreadItem key={thread.id} thread={thread} />
                ))
              )}
            </div>
          </SidebarSection>
        )}

        {/* Threads Section */}
        <SidebarSection
          title="Threads"
          icon={<MessageSquare className="w-4 h-4 text-white" />}
          count={filteredThreads.active.length}
          isCollapsed={collapsedSections.threads}
          onToggle={() => toggleSection('threads')}
        >
          <div className="space-y-1">
            {isLoading ? (
              <LoadingSkeletons count={3} />
            ) : filteredThreads.active.length > 0 ? (
              filteredThreads.active.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))
            ) : searchQuery ? (
              <div className="text-sm text-gray-400 p-2">
                No threads found for "{searchQuery}"
              </div>
            ) : (
              <div className="text-sm text-gray-400 p-2">
                No active threads
              </div>
            )}
          </div>
        </SidebarSection>

        {/* Huddles Section */}
        <SidebarSection
          title="Huddles"
          icon={<Headphones className="w-4 h-4 text-green-400" />}
          count={filteredThreads.huddles.length}
          isCollapsed={collapsedSections.huddles}
          onToggle={() => toggleSection('huddles')}
        >
          <div className="space-y-1">
            {isLoading ? (
              <LoadingSkeletons count={2} />
            ) : (
              filteredThreads.huddles.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))
            )}
          </div>
        </SidebarSection>

        {/* Drafts & Sent Section */}
        <SidebarSection
          title="Drafts & sent"
          icon={<Edit className="w-4 h-4 text-orange-400" />}
          count={drafts.length}
          isCollapsed={collapsedSections.drafts}
          onToggle={() => toggleSection('drafts')}
        >
          <div className="space-y-1">
            {isLoading ? (
              <LoadingSkeletons count={2} />
            ) : (
              drafts.map((draft) => (
                <DraftItem key={draft.id} draft={draft} />
              ))
            )}
          </div>
        </SidebarSection>

        {/* External Connections Section */}
        <SidebarSection
          title="External Connections"
          icon={<ExternalLink className="w-4 h-4 text-amber-400" />}
          count={filteredThreads.external.length}
          isCollapsed={collapsedSections.external}
          onToggle={() => toggleSection('external')}
        >
          <div className="space-y-1">
            {isLoading ? (
              <LoadingSkeletons count={2} />
            ) : (
              filteredThreads.external.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))
            )}
          </div>
        </SidebarSection>

        {/* Starred Section */}
        <SidebarSection
          title="Starred"
          icon={<Star className="w-4 h-4 text-yellow-400" />}
          count={filteredThreads.starred.length}
          isCollapsed={collapsedSections.starred}
          onToggle={() => toggleSection('starred')}
        >
          <div className="space-y-1">
            {isLoading ? (
              <LoadingSkeletons count={2} />
            ) : (
              filteredThreads.starred.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))
            )}
          </div>
        </SidebarSection>

        {/* Channels Section */}
        <SidebarSection
          title="Channels"
          icon={<Hash className="w-4 h-4 text-blue-400" />}
          count={filteredThreads.channels.length}
          isCollapsed={collapsedSections.channels}
          onToggle={() => toggleSection('channels')}
        >
          <div className="space-y-1">
            {isLoading ? (
              <LoadingSkeletons count={2} />
            ) : (
              filteredThreads.channels.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))
            )}
          </div>
        </SidebarSection>

        {/* Direct Messages Section */}
        <SidebarSection
          title="Direct messages"
          icon={<User className="w-4 h-4 text-purple-400" />}
          count={filteredThreads.direct.length}
          isCollapsed={collapsedSections.direct}
          onToggle={() => toggleSection('direct')}
        >
          <div className="space-y-1">
            {isLoading ? (
              <LoadingSkeletons count={2} />
            ) : (
              filteredThreads.direct.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))
            )}
          </div>
        </SidebarSection>

        {/* Apps Section */}
        <SidebarSection
          title="Apps"
          icon={<Bot className="w-4 h-4 text-cyan-400" />}
          count={3}
          isCollapsed={collapsedSections.apps || false}
          onToggle={() => toggleSection('apps')}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-800/50">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white">AI Context Memory</span>
              <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-400 text-xs">
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-800/50">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white">Draft Reminders</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-800/50">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-white">External User Alerts</span>
            </div>
          </div>
        </SidebarSection>
      </div>

      {/* Thread Creation Dialog */}
      <ThreadCreationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateThread={handleCreateThreadWithDialog}
        organizationMembers={organizationMembers}
      />

      {/* Thread Management Dialog */}
      {selectedThreadForManagement && (
        <ThreadManagementDialog
          isOpen={showManageDialog}
          onClose={() => {
            setShowManageDialog(false)
            setSelectedThreadForManagement(null)
          }}
          thread={selectedThreadForManagement}
          organizationMembers={organizationMembers}
          currentUser={{
            id: session?.user?.id || '',
            name: session?.user?.name || '',
            email: session?.user?.email || ''
          }}
          onUpdateThread={handleUpdateThread}
          onInviteMember={handleInviteMember}
          onRemoveMember={handleRemoveMember}
          onArchiveThread={handleArchiveThread}
          onDeleteThread={handleDeleteThread}
        />
      )}
    </div>
  )
}