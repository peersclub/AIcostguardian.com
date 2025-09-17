'use client'

import React, { useState } from 'react'
import { 
  MessageSquare, Plus, Search, MoreVertical, Users, 
  Trash2, Archive, Pin, Share2, Edit2, Clock, Tag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Thread {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  pinned: boolean
  archived: boolean
  tags: string[]
  collaborators?: string[]
}

interface ThreadManagerProps {
  threads: Thread[]
  currentThreadId: string | null
  onSelectThread: (threadId: string) => void
  onCreateThread: () => void
  onDeleteThread: (threadId: string) => void
  onArchiveThread: (threadId: string) => void
  onPinThread: (threadId: string) => void
  onShareThread: (threadId: string) => void
  onRenameThread: (threadId: string, newTitle: string) => void
  onInviteCollaborator: (threadId: string, email: string) => void
}

export function ThreadManager({
  threads,
  currentThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  onArchiveThread,
  onPinThread,
  onShareThread,
  onRenameThread,
  onInviteCollaborator
}: ThreadManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteThreadId, setInviteThreadId] = useState<string | null>(null)

  const filteredThreads = threads.filter(thread => {
    if (!showArchived && thread.archived) return false
    if (searchQuery) {
      return thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  const handleRename = (threadId: string) => {
    if (editingTitle.trim()) {
      onRenameThread(threadId, editingTitle)
      setEditingThreadId(null)
      setEditingTitle('')
    }
  }

  const handleInvite = () => {
    if (inviteEmail && inviteThreadId) {
      onInviteCollaborator(inviteThreadId, inviteEmail)
      setInviteEmail('')
      setInviteThreadId(null)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
          <Button
            onClick={onCreateThread}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-900 border-gray-800 text-sm"
          />
        </div>
        
        {/* Filter Options */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "text-xs",
              showArchived && "bg-gray-800"
            )}
          >
            <Archive className="w-3 h-3 mr-1" />
            {showArchived ? 'Hide' : 'Show'} Archived
          </Button>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {sortedThreads.map((thread) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "border-b border-gray-800 hover:bg-gray-900/50 transition-colors",
                currentThreadId === thread.id && "bg-indigo-950/20 border-l-2 border-l-indigo-500"
              )}
            >
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectThread(thread.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {thread.pinned && (
                        <Pin className="w-3 h-3 text-yellow-500" />
                      )}
                      {editingThreadId === thread.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleRename(thread.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(thread.id)}
                          className="h-6 text-sm bg-gray-800 border-gray-700"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="text-sm font-medium text-white truncate">
                          {thread.title}
                        </h3>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {thread.lastMessage}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-600">
                        {thread.messageCount} messages
                      </span>
                      <span className="text-[10px] text-gray-600">•</span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(thread.timestamp).toLocaleDateString()}
                      </span>
                      {thread.collaborators && thread.collaborators.length > 0 && (
                        <>
                          <span className="text-[10px] text-gray-600">•</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600">
                              {thread.collaborators.length}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {thread.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {thread.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Thread Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => {
                        setEditingThreadId(thread.id)
                        setEditingTitle(thread.title)
                      }}>
                        <Edit2 className="w-3 h-3 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => onPinThread(thread.id)}>
                        <Pin className="w-3 h-3 mr-2" />
                        {thread.pinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => onArchiveThread(thread.id)}>
                        <Archive className="w-3 h-3 mr-2" />
                        {thread.archived ? 'Unarchive' : 'Archive'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => onShareThread(thread.id)}>
                        <Share2 className="w-3 h-3 mr-2" />
                        Share
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => {
                        setInviteThreadId(thread.id)
                      }}>
                        <Users className="w-3 h-3 mr-2" />
                        Invite Collaborator
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => onDeleteThread(thread.id)}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Invite Collaborator Dialog */}
      <Dialog open={!!inviteThreadId} onOpenChange={(open) => !open && setInviteThreadId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Add someone to this conversation by entering their email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInviteThreadId(null)}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}