'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  Search, Users, Send, MoreVertical, Phone, Video,
  Settings, Pin, Archive, Hash, AtSign, Smile,
  Paperclip, Mic, Plus, X, Check, Circle,
  MessageSquare, UserPlus, Shield, Star, Filter,
  ChevronDown, Clock, Bell, BellOff, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface OrganizationMember {
  id: string
  name: string
  email: string
  image?: string
  role: string
  department?: string
  jobTitle?: string
  isOnline: boolean
  lastActiveAt?: string
  status?: 'online' | 'away' | 'busy' | 'offline'
  statusMessage?: string
}

interface Channel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  memberCount?: number
  unreadCount?: number
  lastMessage?: {
    content: string
    sender: string
    timestamp: string
  }
  isPinned?: boolean
  isMuted?: boolean
}

interface DirectMessage {
  id: string
  userId: string
  user: OrganizationMember
  lastMessage?: {
    content: string
    timestamp: string
    isFromMe: boolean
  }
  unreadCount?: number
  isOnline?: boolean
}

interface OrgMessagingInterfaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationMembers: OrganizationMember[]
}

export function OrgMessagingInterface({
  open,
  onOpenChange,
  organizationMembers = []
}: OrgMessagingInterfaceProps) {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState<'channels' | 'direct'>('direct')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<OrganizationMember | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data - in real implementation, this would come from API
  const [channels] = useState<Channel[]>([
    {
      id: '1',
      name: 'general',
      description: 'Company-wide announcements and general discussion',
      type: 'public',
      memberCount: 25,
      unreadCount: 3,
      lastMessage: {
        content: 'Welcome to the team!',
        sender: 'John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    },
    {
      id: '2',
      name: 'ai-discussions',
      description: 'Discuss AI implementations and best practices',
      type: 'public',
      memberCount: 12,
      unreadCount: 0,
      lastMessage: {
        content: 'Great insights on the Claude implementation!',
        sender: 'Sarah Wilson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    }
  ])

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])

  useEffect(() => {
    // Convert organization members to direct message format
    const dms = organizationMembers
      .filter(member => member.id !== session?.user?.id)
      .map(member => ({
        id: member.id,
        userId: member.id,
        user: member,
        unreadCount: 0,
        isOnline: member.isOnline
      }))
    setDirectMessages(dms)
  }, [organizationMembers, session?.user?.id])

  const filteredMembers = organizationMembers.filter(member => {
    if (!searchTerm) return true
    return (
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }).filter(member => member.id !== session?.user?.id)

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return

    try {
      // In real implementation, send message via API
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          message: messageInput.trim(),
          type: 'direct'
        })
      })

      if (response.ok) {
        setMessageInput('')
        toast.success('Message sent!')
      }
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleStartDirectMessage = (member: OrganizationMember) => {
    setSelectedUser(member)
    setSelectedTab('direct')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[85vh] bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl flex overflow-hidden"
      >
        {/* Sidebar */}
        <div className="w-80 bg-gray-800/30 border-r border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Team Chat</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Search people, channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setSelectedTab('direct')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                selectedTab === 'direct'
                  ? "text-white border-b-2 border-indigo-500 bg-gray-700/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/20"
              )}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Direct Messages
            </button>
            <button
              onClick={() => setSelectedTab('channels')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                selectedTab === 'channels'
                  ? "text-white border-b-2 border-indigo-500 bg-gray-700/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/20"
              )}
            >
              <Hash className="h-4 w-4 inline mr-2" />
              Channels
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            {selectedTab === 'direct' && (
              <div className="p-2 space-y-1">
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.3)' }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedUser?.id === member.id && "bg-indigo-600/20 border border-indigo-500/30"
                    )}
                    onClick={() => handleStartDirectMessage(member)}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.image} />
                        <AvatarFallback className="bg-indigo-600/20 text-indigo-300 text-sm">
                          {member.name?.[0] || member.email[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-800",
                        member.isOnline ? "bg-indigo-400" : "bg-gray-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {member.name || member.email}
                        </span>
                        {member.isOnline && (
                          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {member.jobTitle && member.department
                          ? `${member.jobTitle} • ${member.department}`
                          : member.jobTitle || member.department || member.email
                        }
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Voice Call
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Video className="h-4 w-4 mr-2" />
                          Video Call
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Info className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}

            {selectedTab === 'channels' && (
              <div className="p-2 space-y-1">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-colors"
                  >
                    <Hash className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {channel.name}
                        </span>
                        {(channel.unreadCount ?? 0) > 0 && (
                          <Badge variant="destructive" className="text-xs h-5 px-1.5">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {channel.memberCount} members
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 bg-gray-800/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.image} />
                      <AvatarFallback className="bg-indigo-600/20 text-indigo-300">
                        {selectedUser.name?.[0] || selectedUser.email[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">
                        {selectedUser.name || selectedUser.email}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {selectedUser.isOnline ? 'Active now' :
                         selectedUser.lastActiveAt ?
                         `Last seen ${formatDistanceToNow(new Date(selectedUser.lastActiveAt))} ago` :
                         'Offline'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice Call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Video className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Video Call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Placeholder for messages */}
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      Start a conversation with {selectedUser.name || selectedUser.email}
                    </p>
                  </div>
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700 bg-gray-800/20">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder={`Message ${selectedUser.name || selectedUser.email}...`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400 pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Paperclip className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Smile className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Choose someone from your organization to start chatting, or browse channels to join discussions.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}