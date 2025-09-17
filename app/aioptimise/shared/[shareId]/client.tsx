'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft, Share2, Eye, Users, Clock, Shield,
  MessageSquare, User, Bot, ExternalLink, Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { getAIProviderLogoWithFallback } from '@/components/ui/ai-logos'

interface Thread {
  id: string
  title: string
  userId: string
  mode: string
  metadata: any
  createdAt: Date
  updatedAt: Date
  messageCount: number | undefined
  messages?: any[]
  user?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface ThreadOwner {
  id: string
  name: string
  email: string
  image: string
}

interface SharedThreadClientProps {
  thread: Thread
  threadOwner: ThreadOwner
  shareId: string
}

export default function SharedThreadClient({
  thread,
  threadOwner,
  shareId
}: SharedThreadClientProps) {
  const [showDetails, setShowDetails] = useState(false)

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/aioptimise/shared/${shareId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard')
  }

  const goToAIOptimise = () => {
    window.location.href = '/aioptimise'
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-950">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToAIOptimise}
                className="text-gray-300 hover:text-white hover:bg-gray-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to AI Optimise
              </Button>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white">Shared Thread</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyShareLink}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy share link</TooltipContent>
              </Tooltip>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-300 hover:text-white hover:bg-gray-800/50"
              >
                <Shield className="w-4 h-4 mr-2" />
                {showDetails ? 'Hide Details' : 'View Details'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 pt-20 pb-6">
          <div className="max-w-4xl mx-auto px-4">
            {/* Thread Info */}
            <Card className="mb-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={threadOwner.image} alt={threadOwner.name} />
                      <AvatarFallback className="bg-gray-800 text-gray-300">
                        {threadOwner.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl font-semibold text-white">
                        {thread.title}
                      </h1>
                      <p className="text-sm text-gray-400">
                        Shared by {threadOwner.name} • {thread.messageCount || 0} messages •
                        {' '}{formatDistanceToNow(new Date(thread.createdAt))} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                      {thread.mode}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-indigo-500/50 text-indigo-300">
                      <Users className="w-3 h-3 mr-1" />
                      Shared
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Created</p>
                          <p className="text-gray-200">
                            {formatDistanceToNow(new Date(thread.createdAt))} ago
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Updated</p>
                          <p className="text-gray-200">
                            {formatDistanceToNow(new Date(thread.updatedAt))} ago
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Messages</p>
                          <p className="text-gray-200">{thread.messageCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Mode</p>
                          <p className="text-gray-200">{thread.mode}</p>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Messages */}
            <div className="space-y-4">
              {thread.messages && thread.messages.length > 0 ? (
                thread.messages.map((message: any, index: number) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "p-4 border-gray-800",
                      message.role === 'user'
                        ? "ml-8 bg-indigo-900/20 backdrop-blur-sm border-indigo-800/50"
                        : "mr-8 bg-gray-900/30 backdrop-blur-sm"
                    )}>
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          {message.role === 'user' ? (
                            <>
                              <AvatarImage src={threadOwner.image} alt={threadOwner.name} />
                              <AvatarFallback className="bg-gray-800 text-gray-300">
                                {threadOwner.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </>
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-indigo-900/50 rounded-full">
                              <Bot className="w-4 h-4 text-indigo-400" />
                            </div>
                          )}
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-white">
                              {message.role === 'user' ? threadOwner.name : 'AI Assistant'}
                            </span>
                            {message.selectedProvider && (
                              <div className="flex items-center space-x-1">
                                {getAIProviderLogoWithFallback(message.selectedProvider)}
                                <span className="text-xs text-gray-400">
                                  {message.selectedModel || message.selectedProvider}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(message.createdAt || message.timestamp))} ago
                            </span>
                          </div>

                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-lg"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center bg-gray-900/30 backdrop-blur-sm border-gray-800">
                  <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Messages</h3>
                  <p className="text-gray-400">
                    This shared thread doesn't contain any messages yet.
                  </p>
                </Card>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <Card className="p-4 bg-gray-900/20 backdrop-blur-sm border-gray-800">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Read-only shared thread</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ExternalLink className="w-4 h-4" />
                    <Button
                      variant="link"
                      size="sm"
                      onClick={goToAIOptimise}
                      className="p-0 h-auto text-gray-400 hover:text-white"
                    >
                      Try AI Optimise yourself
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}