'use client'

import React, { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Hash, User, Headphones, ExternalLink, MessageSquare,
  Users, Globe, Shield, Sparkles, X, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThreadCreationDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateThread: (data: ThreadCreationData) => Promise<void>
  organizationMembers?: any[]
}

interface ThreadCreationData {
  title: string
  description?: string
  threadType: 'STANDARD' | 'DIRECT' | 'CHANNEL' | 'HUDDLE' | 'EXTERNAL' | 'PROJECT'
  sharedWithEmails?: string[]
  isPrivate?: boolean
  collaborators?: string[]
}

const threadTypes = [
  {
    id: 'STANDARD',
    name: 'Standard Chat',
    description: 'Regular AI conversation thread',
    icon: MessageSquare,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10'
  },
  {
    id: 'CHANNEL',
    name: 'Channel',
    description: 'Organized topic-based discussion',
    icon: Hash,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'DIRECT',
    name: 'Direct Message',
    description: 'Private one-on-one conversation',
    icon: User,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'HUDDLE',
    name: 'Team Huddle',
    description: 'Quick team collaboration space',
    icon: Headphones,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 'EXTERNAL',
    name: 'External Collaboration',
    description: 'Collaborate with external teams',
    icon: ExternalLink,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  {
    id: 'PROJECT',
    name: 'Project Thread',
    description: 'Long-term project discussion',
    icon: Sparkles,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10'
  }
]

export function ThreadCreationDialog({
  isOpen,
  onClose,
  onCreateThread,
  organizationMembers = []
}: ThreadCreationDialogProps) {
  const [selectedType, setSelectedType] = useState<string>('STANDARD')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [externalEmails, setExternalEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const selectedTypeData = threadTypes.find(t => t.id === selectedType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await onCreateThread({
        title: title.trim(),
        description: description.trim() || undefined,
        threadType: selectedType as ThreadCreationData['threadType'],
        sharedWithEmails: externalEmails,
        isPrivate,
        collaborators: selectedMembers
      })

      // Reset form
      setTitle('')
      setDescription('')
      setSelectedType('STANDARD')
      setExternalEmails([])
      setSelectedMembers([])
      setIsPrivate(false)
      onClose()
    } catch (error) {
      console.error('Failed to create thread:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addExternalEmail = () => {
    if (newEmail.trim() && newEmail.includes('@') && !externalEmails.includes(newEmail.trim())) {
      setExternalEmails([...externalEmails, newEmail.trim()])
      setNewEmail('')
    }
  }

  const removeExternalEmail = (email: string) => {
    setExternalEmails(externalEmails.filter(e => e !== email))
  }

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/50 backdrop-blur-xl border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Create New Thread
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a thread type and configure your AI collaboration space
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thread Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Thread Type</label>
            <div className="grid grid-cols-2 gap-3">
              {threadTypes.map((type) => {
                const Icon = type.icon
                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "p-4 rounded-lg border transition-all text-left",
                      selectedType === type.id
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", type.bgColor)}>
                        <Icon className={cn("w-4 h-4", type.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">{type.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Thread Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${selectedTypeData?.name} title...`}
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this thread..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* External Collaboration (for EXTERNAL type) */}
          {selectedType === 'EXTERNAL' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">External Collaborators</label>
              <div className="flex gap-2">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addExternalEmail()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addExternalEmail}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {externalEmails.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">External collaborators:</div>
                  <div className="flex flex-wrap gap-2">
                    {externalEmails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeExternalEmail(email)}
                          className="ml-2 hover:text-amber-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Organization Members (for CHANNEL, HUDDLE, PROJECT types) */}
          {(['CHANNEL', 'HUDDLE', 'PROJECT'].includes(selectedType)) && organizationMembers.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Invite Organization Members
              </label>
              <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-700 rounded-lg p-3">
                {organizationMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer"
                    onClick={() => toggleMember(member.id)}
                  >
                    <div className={cn(
                      "w-4 h-4 border-2 rounded",
                      selectedMembers.includes(member.id)
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-gray-600"
                    )}>
                      {selectedMembers.includes(member.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{member.name || member.email}</div>
                      {member.name && (
                        <div className="text-xs text-gray-400">{member.email}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  {selectedTypeData?.icon && React.createElement(selectedTypeData.icon, { className: "w-4 h-4 mr-2" })}
                  Create {selectedTypeData?.name}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}