'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare, FileText, Star, Globe, Settings, Plus, Search,
  ChevronDown, ChevronRight, Users, Headphones, Archive, Bell,
  Clock, Hash, User, Bot, ExternalLink, AlertTriangle, Edit
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

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
  onThreadSelect: (threadId: string) => void
  onCreateThread: () => void
  onToggleStar: (threadId: string) => void
  organizationMembers: any[]
  className?: string
}

interface SidebarSection {
  id: string
  title: string
  icon: React.ReactNode
  count?: number
  items: any[]
  isCollapsed: boolean
  onToggle: () => void
}

export function EnhancedSidebar({
  threads,
  drafts,
  currentThread,
  isOpen,
  onThreadSelect,
  onCreateThread,
  onToggleStar,
  organizationMembers,
  className
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

  // Filter and categorize threads
  const activeThreads = threads.filter(t => !t.isArchived && t.threadType === 'STANDARD')
  const starredThreads = threads.filter(t => t.isStarred && !t.isArchived)
  const externalThreads = threads.filter(t => t.hasExternalUsers && !t.isArchived)
  const channelThreads = threads.filter(t => t.threadType === 'CHANNEL' && !t.isArchived)
  const directThreads = threads.filter(t => t.threadType === 'DIRECT' && !t.isArchived)
  const huddleThreads = threads.filter(t => t.threadType === 'HUDDLE' && !t.isArchived)

  // Search filtering
  const filteredThreads = {
    active: activeThreads.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    starred: starredThreads.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    external: externalThreads.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    channels: channelThreads.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    direct: directThreads.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    huddles: huddleThreads.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getDomainFromEmail = (email: string) => {
    return email.split('@')[1] || email
  }

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
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const ThreadItem = ({ thread }: { thread: Thread }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
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
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </motion.div>
  )

  const DraftItem = ({ draft }: { draft: Draft }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-800/50"
    >
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
    </motion.div>
  )

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: 'spring', damping: 25 }}
      className={cn(
        "w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 flex flex-col h-full",
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
          <Button
            onClick={onCreateThread}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-9 bg-gray-900 border-gray-800 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Threads Section */}
        <SidebarSection
          title="Threads"
          icon={<MessageSquare className="w-4 h-4 text-white" />}
          count={filteredThreads.active.length}
          isCollapsed={collapsedSections.threads}
          onToggle={() => toggleSection('threads')}
        >
          <div className="space-y-1">
            {filteredThreads.active.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
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
            {filteredThreads.huddles.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
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
            {drafts.map((draft) => (
              <DraftItem key={draft.id} draft={draft} />
            ))}
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
            {filteredThreads.external.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
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
            {filteredThreads.starred.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
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
            {filteredThreads.channels.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
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
            {filteredThreads.direct.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
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
    </motion.div>
  )
}