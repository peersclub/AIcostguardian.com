'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Edit, Users, Settings, Archive, Trash2, UserPlus,
  Mail, Crown, Eye, ExternalLink, X, Check,
  AlertTriangle, Shield, Globe, Copy, Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ThreadManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  thread: {
    id: string
    title: string
    description?: string
    threadType: string
    hasExternalUsers: boolean
    collaborators?: any[]
    sharedWithEmails?: string[]
    isArchived: boolean
    isStarred: boolean
    isPinned: boolean
  }
  organizationMembers?: any[]
  currentUser: {
    id: string
    name?: string
    email: string
  }
  onUpdateThread: (threadId: string, updates: any) => Promise<void>
  onInviteMember: (threadId: string, memberId: string, role: string) => Promise<void>
  onRemoveMember: (threadId: string, memberId: string) => Promise<void>
  onArchiveThread: (threadId: string) => Promise<void>
  onDeleteThread: (threadId: string) => Promise<void>
}

export function ThreadManagementDialog({
  isOpen,
  onClose,
  thread,
  organizationMembers = [],
  currentUser,
  onUpdateThread,
  onInviteMember,
  onRemoveMember,
  onArchiveThread,
  onDeleteThread
}: ThreadManagementDialogProps) {
  const [activeTab, setActiveTab] = useState('edit')
  const [isLoading, setIsLoading] = useState(false)

  // Edit form state
  const [title, setTitle] = useState(thread.title)
  const [description, setDescription] = useState(thread.description || '')

  // Invite state
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [selectedRole, setSelectedRole] = useState('VIEWER')
  const [externalEmail, setExternalEmail] = useState('')

  // Pending invitations
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchPendingInvitations()
    }
  }, [isOpen, thread.id])

  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${thread.id}/invite`)
      if (response.ok) {
        const data = await response.json()
        setPendingInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending invitations:', error)
    }
  }

  const handleUpdateThread = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await onUpdateThread(thread.id, {
        title: title.trim(),
        description: description.trim() || undefined
      })
      toast.success('Thread updated successfully')
    } catch (error) {
      toast.error('Failed to update thread')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!selectedMemberId) return

    setIsLoading(true)
    try {
      await onInviteMember(thread.id, selectedMemberId, selectedRole)
      setSelectedMemberId('')
      setSelectedRole('VIEWER')
      await fetchPendingInvitations()
      toast.success('Invitation sent successfully')
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteExternal = async () => {
    if (!externalEmail.trim() || !externalEmail.includes('@')) return

    setIsLoading(true)
    try {
      // Add external email to shared list
      await onUpdateThread(thread.id, {
        sharedWithEmails: [...(thread.sharedWithEmails || []), externalEmail.trim()]
      })
      setExternalEmail('')
      toast.success('External user invited successfully')
    } catch (error) {
      toast.error('Failed to invite external user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === currentUser.id) {
      toast.error("You cannot remove yourself")
      return
    }

    setIsLoading(true)
    try {
      await onRemoveMember(thread.id, memberId)
      await fetchPendingInvitations()
      toast.success('Member removed successfully')
    } catch (error) {
      toast.error('Failed to remove member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchiveThread = async () => {
    setIsLoading(true)
    try {
      await onArchiveThread(thread.id)
      toast.success('Thread archived successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to archive thread')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      await onDeleteThread(thread.id)
      toast.success('Thread deleted successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to delete thread')
    } finally {
      setIsLoading(false)
    }
  }

  const copyThreadLink = () => {
    const url = `${window.location.origin}/aioptimise?thread=${thread.id}`
    navigator.clipboard.writeText(url)
    toast.success('Thread link copied to clipboard')
  }

  const availableMembers = organizationMembers.filter(member =>
    !thread.collaborators?.some(collab => collab.userId === member.id) &&
    member.id !== currentUser.id
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/50 backdrop-blur-xl border-gray-700 text-white max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Manage Thread
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Edit thread settings, invite members, and manage permissions
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invite
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1 mt-4">
            <TabsContent value="edit" className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Thread Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdateThread}
                  disabled={isLoading || !title.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? 'Updating...' : 'Update Thread'}
                </Button>
                <Button
                  onClick={copyThreadLink}
                  variant="secondary"
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Current Collaborators</h3>
                <div className="space-y-2">
                  {thread.collaborators?.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={collaborator.user?.image} />
                          <AvatarFallback>
                            {collaborator.user?.name?.[0] || collaborator.user?.email?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-white">
                            {collaborator.user?.name || collaborator.user?.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {collaborator.user?.email}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            collaborator.role === 'ADMIN'
                              ? "bg-purple-500/20 text-purple-400"
                              : collaborator.role === 'EDITOR'
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          )}
                        >
                          {collaborator.role === 'ADMIN' && <Crown className="w-3 h-3 mr-1" />}
                          {collaborator.role === 'EDITOR' && <Edit className="w-3 h-3 mr-1" />}
                          {collaborator.role === 'VIEWER' && <Eye className="w-3 h-3 mr-1" />}
                          {collaborator.role}
                        </Badge>
                      </div>
                      {collaborator.userId !== currentUser.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(collaborator.userId)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {thread.sharedWithEmails && thread.sharedWithEmails.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">External Collaborators</h3>
                  <div className="space-y-2">
                    {thread.sharedWithEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-5 h-5 text-amber-400" />
                          <div>
                            <div className="text-sm text-white">{email}</div>
                            <div className="text-xs text-amber-400">External collaborator</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingInvitations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Pending Invitations</h3>
                  <div className="space-y-2">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={invitation.user?.image} />
                            <AvatarFallback>
                              {invitation.user?.name?.[0] || invitation.user?.email?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm text-white">
                              {invitation.user?.name || invitation.user?.email}
                            </div>
                            <div className="text-xs text-yellow-400">Pending invitation</div>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                            {invitation.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="invite" className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Invite Organization Members</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select member..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {availableMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name || member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleInviteMember}
                      disabled={!selectedMemberId || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Invite
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Invite External Users</h3>
                <div className="flex gap-2">
                  <Input
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                  <Button
                    onClick={handleInviteExternal}
                    disabled={!externalEmail.trim() || isLoading}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  External users will receive an invitation to collaborate on this thread
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    These actions cannot be undone. Please be certain.
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={handleArchiveThread}
                      disabled={isLoading || thread.isArchived}
                      variant="destructive"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      {thread.isArchived ? 'Already Archived' : 'Archive Thread'}
                    </Button>

                    <Button
                      onClick={handleDeleteThread}
                      disabled={isLoading}
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Thread Permanently
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <Button
            onClick={onClose}
            variant="secondary"
            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 text-gray-300 hover:text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}