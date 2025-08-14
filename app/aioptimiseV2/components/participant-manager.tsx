'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, UserPlus, UserMinus, Crown, Shield, User,
  Settings, MoreVertical, Check, X, Search,
  Mail, Phone, Globe, MapPin, Clock, Activity,
  Video, Mic, MicOff, VideoOff, Share2, Copy,
  Lock, Unlock, Eye, EyeOff, UserCheck, UserX,
  AlertCircle, Info, Star, Award, Zap, MessageSquare,
  Edit3, Trash2, Ban, Link, Send, ChevronDown,
  ChevronUp, ArrowRight, Plus, Minus, Hash,
  AtSign, Bell, BellOff, Volume2, VolumeX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
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

interface Participant {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'online' | 'away' | 'offline'
  isTyping?: boolean
  isSpeaking?: boolean
  lastSeen?: string
  joinedAt: string
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
    canManageModels: boolean
    canViewCosts: boolean
  }
}

interface ParticipantManagerProps {
  threadId: string
  currentUserId: string
  participants: Participant[]
  onInvite: (email: string, role: string) => void
  onRemove: (participantId: string) => void
  onUpdateRole: (participantId: string, role: string) => void
  onUpdatePermissions: (participantId: string, permissions: any) => void
  isCollaborationEnabled?: boolean
  maxParticipants?: number
}

export function ParticipantManager({
  threadId,
  currentUserId,
  participants,
  onInvite,
  onRemove,
  onUpdateRole,
  onUpdatePermissions,
  isCollaborationEnabled = true,
  maxParticipants = 10
}: ParticipantManagerProps) {
  const [showManager, setShowManager] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer')
  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  
  const currentUser = participants.find(p => p.id === currentUserId)
  const isOwner = currentUser?.role === 'owner'
  const isAdmin = currentUser?.role === 'admin' || isOwner
  
  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const onlineCount = participants.filter(p => p.status === 'online').length
  const typingUsers = participants.filter(p => p.isTyping && p.id !== currentUserId)
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown
      case 'admin': return Shield
      case 'editor': return Edit3
      default: return Eye
    }
  }
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      case 'admin': return 'text-purple-400 border-purple-500/30 bg-purple-500/10'
      case 'editor': return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-yellow-400'
      default: return 'bg-gray-400'
    }
  }
  
  const handleInvite = () => {
    if (!inviteEmail || !isCollaborationEnabled) return
    
    onInvite(inviteEmail, inviteRole)
    setInviteEmail('')
    setShowInviteDialog(false)
  }
  
  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/join/${threadId}`
    await navigator.clipboard.writeText(inviteLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }
  
  return (
    <>
      {/* Collaboration Status Bar */}
      <div className="flex items-center gap-3">
        {/* Active Participants */}
        {onlineCount > 1 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {participants
                .filter(p => p.status === 'online')
                .slice(0, 3)
                .map((participant) => (
                  <TooltipProvider key={participant.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Avatar className="w-8 h-8 border-2 border-gray-800">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800",
                            getStatusColor(participant.status)
                          )} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-gray-400">{participant.role}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </div>
            {onlineCount > 3 && (
              <Badge className="bg-gray-700 text-gray-300 text-xs">
                +{onlineCount - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full"
          >
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
            </div>
            <span className="text-xs text-gray-400">
              {typingUsers.length === 1 
                ? `${typingUsers[0].name} is typing`
                : `${typingUsers.length} people typing`}
            </span>
          </motion.div>
        )}
        
        {/* Manage Button */}
        <Button
          onClick={() => setShowManager(!showManager)}
          variant="outline"
          size="sm"
          className="border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300"
        >
          <Users className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Collaborate</span>
          <Badge className="ml-2 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            {onlineCount}
          </Badge>
        </Button>
      </div>
      
      {/* Participant Manager Panel */}
      <AnimatePresence>
        {showManager && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full right-0 mt-2 w-96 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-800 shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Collaboration
                  </h3>
                  <button
                    onClick={() => setShowManager(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search participants..."
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              {/* Participants List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredParticipants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900",
                            getStatusColor(participant.status)
                          )} />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{participant.name}</p>
                            {participant.id === currentUserId && (
                              <Badge className="text-xs bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge className={cn("text-xs", getRoleColor(participant.role))}>
                              {React.createElement(getRoleIcon(participant.role), { className: "w-3 h-3 mr-1" })}
                              {participant.role}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {participant.status === 'online' 
                                ? 'Active now'
                                : participant.lastSeen 
                                ? `Last seen ${participant.lastSeen}`
                                : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {isAdmin && participant.id !== currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {isOwner && (
                              <>
                                <DropdownMenuItem onClick={() => onUpdateRole(participant.id, 'admin')}>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdateRole(participant.id, 'editor')}>
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Make Editor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdateRole(participant.id, 'viewer')}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => onRemove(participant.id)}
                              className="text-red-400 focus:text-red-400"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {/* Activity Indicators */}
                    {(participant.isTyping || participant.isSpeaking) && (
                      <div className="flex items-center gap-2 mt-2">
                        {participant.isTyping && (
                          <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Typing
                          </Badge>
                        )}
                        {participant.isSpeaking && (
                          <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            <Volume2 className="w-3 h-3 mr-1" />
                            Speaking
                          </Badge>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Footer Actions */}
              {isCollaborationEnabled && isAdmin && (
                <div className="p-4 border-t border-gray-800 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowInviteDialog(true)}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      disabled={participants.length >= maxParticipants}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Participant
                    </Button>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={copyInviteLink}
                            variant="outline"
                            size="icon"
                            className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                          >
                            {copySuccess ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Link className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copySuccess ? 'Copied!' : 'Copy invite link'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {participants.length >= maxParticipants && (
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Maximum participants reached ({maxParticipants})
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              Invite Participant
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Invite someone to collaborate on this conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['admin', 'editor', 'viewer'] as const).map((role) => {
                  const Icon = getRoleIcon(role)
                  return (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        inviteRole === role
                          ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                      )}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs capitalize">{role}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInvite}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                disabled={!inviteEmail}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
              <Button
                onClick={() => setShowInviteDialog(false)}
                variant="outline"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

const React = { createElement: (component: any, props: any) => null }