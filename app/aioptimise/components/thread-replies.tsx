'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MessageSquare,
  Send,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Quote,
  Edit,
  Trash2,
  Pin,
  Bookmark,
  Share2,
  Copy,
  X,
  ArrowLeft,
  Users,
  Clock,
  Hash
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface ThreadReply {
  id: string
  content: string
  authorId: string
  authorName: string
  authorEmail: string
  authorAvatar?: string
  createdAt: string
  updatedAt?: string
  isEdited: boolean
  reactions: Reaction[]
  mentions: string[]
  parentId?: string
  replies: ThreadReply[]
  attachments?: Attachment[]
}

interface Reaction {
  id: string
  emoji: string
  count: number
  users: {
    id: string
    name: string
  }[]
  hasUserReacted: boolean
}

interface Attachment {
  id: string
  type: 'image' | 'file' | 'code'
  name: string
  url: string
  size: number
}

interface ThreadRepliesProps {
  isOpen: boolean
  onClose: () => void
  parentMessage: {
    id: string
    content: string
    authorName: string
    authorAvatar?: string
    createdAt: string
    threadTitle?: string
  }
  replies: ThreadReply[]
  currentUser: {
    id: string
    name: string
    email: string
    image?: string
  }
  onSendReply: (content: string, parentId?: string) => Promise<void>
  onAddReaction: (replyId: string, emoji: string) => Promise<void>
  onEditReply: (replyId: string, content: string) => Promise<void>
  onDeleteReply: (replyId: string) => Promise<void>
}

export function ThreadReplies({
  isOpen,
  onClose,
  parentMessage,
  replies,
  currentUser,
  onSendReply,
  onAddReaction,
  onEditReply,
  onDeleteReply
}: ThreadRepliesProps) {
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingReply, setEditingReply] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLInputElement>(null)
  const repliesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new replies are added
  useEffect(() => {
    if (repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [replies.length])

  // Focus textarea when replying to someone
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

  const handleSendReply = async () => {
    if (!replyContent.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendReply(replyContent.trim(), replyingTo || undefined)
      setReplyContent('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleEditReply = async (replyId: string) => {
    if (!editContent.trim()) return

    try {
      await onEditReply(replyId, editContent.trim())
      setEditingReply(null)
      setEditContent('')
    } catch (error) {
      console.error('Failed to edit reply:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  const handleReaction = async (replyId: string, emoji: string) => {
    try {
      await onAddReaction(replyId, emoji)
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const startEditing = (reply: ThreadReply) => {
    setEditingReply(reply.id)
    setEditContent(reply.content)
  }

  const startReplyingTo = (reply: ThreadReply) => {
    setReplyingTo(reply.id)
    setReplyContent(`@${reply.authorName} `)
    textareaRef.current?.focus()
  }

  const ReplyItem = ({ reply, depth = 0 }: { reply: ThreadReply; depth?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group border-l-2 border-gray-700 pl-4",
        depth > 0 && "ml-6",
        depth > 2 && "ml-4" // Prevent excessive nesting
      )}
    >
      <div className="flex gap-3 py-2">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={reply.authorAvatar} />
          <AvatarFallback>
            {reply.authorName?.[0] || reply.authorEmail?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Reply Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white text-sm">{reply.authorName}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
            </span>
            {reply.isEdited && (
              <Badge variant="secondary" className="bg-gray-700 text-gray-400 text-xs">
                edited
              </Badge>
            )}
          </div>

          {/* Reply Content */}
          {editingReply === reply.id ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleEditReply(reply.id)
                  }
                  if (e.key === 'Escape') {
                    setEditingReply(null)
                    setEditContent('')
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEditReply(reply.id)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingReply(null)
                    setEditContent('')
                  }}
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-300 mb-2">
              <ReactMarkdown>{reply.content}</ReactMarkdown>
            </div>
          )}

          {/* Reactions */}
          {reply.reactions && reply.reactions.length > 0 && (
            <div className="flex gap-1 mb-2">
              {reply.reactions.map((reaction) => (
                <button
                  key={reaction.id}
                  onClick={() => handleReaction(reply.id, reaction.emoji)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                    reaction.hasUserReacted
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Reply Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startReplyingTo(reply)}
              className="h-6 px-2 text-xs text-gray-400 hover:text-white"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReaction(reply.id, '👍')}
              className="h-6 px-2 text-xs text-gray-400 hover:text-white"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              React
            </Button>

            {reply.authorId === currentUser.id && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditing(reply)}
                  className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 bg-gray-800/50 backdrop-blur-xl border-gray-600 text-white">
                    <DropdownMenuItem
                      onClick={() => onDeleteReply(reply.id)}
                      className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Nested Replies */}
          {reply.replies && reply.replies.length > 0 && (
            <div className="mt-3">
              {reply.replies.map((nestedReply) => (
                <ReplyItem key={nestedReply.id} reply={nestedReply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/50 backdrop-blur-xl border-gray-700 text-white max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Thread
                {parentMessage.threadTitle && (
                  <span className="text-gray-400">in #{parentMessage.threadTitle}</span>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {replies.length} repl{replies.length !== 1 ? 'ies' : 'y'} • Started by {parentMessage.authorName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Original Message */}
        <div className="border-b border-gray-700 pb-4">
          <div className="flex gap-3 py-2">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={parentMessage.authorAvatar} />
              <AvatarFallback>
                {parentMessage.authorName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-white">{parentMessage.authorName}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(parentMessage.createdAt), { addSuffix: true })}
                </span>
                <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400 text-xs">
                  Original message
                </Badge>
              </div>
              <div className="text-gray-300">
                <ReactMarkdown>{parentMessage.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {replies.length > 0 ? (
            <>
              {replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
              ))}
              <div ref={repliesEndRef} />
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No replies yet</p>
              <p className="text-sm text-gray-500">Be the first to reply to this thread</p>
            </div>
          )}
        </div>

        {/* Reply Input */}
        <div className="border-t border-gray-700 pt-4">
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
              <Reply className="w-4 h-4" />
              Replying to {replies.find(r => r.id === replyingTo)?.authorName}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent('')
                }}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={currentUser.image} />
              <AvatarFallback>
                {currentUser.name?.[0] || currentUser.email?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                ref={textareaRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Reply to this thread..."
                className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                disabled={isSending}
              />
              <Button
                onClick={handleSendReply}
                disabled={!replyContent.trim() || isSending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}