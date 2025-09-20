import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Sparkles, Send, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrganizationLogo, getOrganizationWelcomeMessage } from './organization-logos'
import { cn } from '@/lib/utils'

interface ThreadEmptyStateProps {
  organizationName?: string
  userName?: string
  onQuickStart?: (message: string) => void
  className?: string
}

export function ThreadEmptyState({
  organizationName = 'AI Cost Guardian',
  userName,
  onQuickStart,
  className
}: ThreadEmptyStateProps) {
  const welcomeInfo = getOrganizationWelcomeMessage(organizationName)

  const quickStartPrompts = [
    "Help me draft a professional email",
    "Assist with document analysis and summary",
    "Brainstorm creative solutions for my project",
    "Help me organize and prioritize my tasks"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] px-8 text-center",
        className
      )}
    >
      {/* Organization Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <OrganizationLogo
          organizationName={organizationName}
          size="xl"
          className="mb-4"
        />

        {/* Decorative elements */}
        <div className="relative">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-12 -right-8 w-6 h-6 text-indigo-400 opacity-60"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>

          <motion.div
            animate={{
              y: [-5, 5, -5],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-8 -left-6 w-4 h-4 text-purple-400 opacity-40"
          >
            <Zap className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>

      {/* Welcome Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {welcomeInfo.title}
        </h1>

        <p className="text-lg text-gray-400 mb-2">
          {welcomeInfo.subtitle}
        </p>

        {userName && (
          <p className="text-gray-500 mb-8">
            Hello {userName}, ready to start a conversation?
          </p>
        )}

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left">
          {welcomeInfo.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
            >
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
              <span className="text-sm text-gray-300">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Quick Start Actions */}
        {onQuickStart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Quick Start
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickStartPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full h-auto p-4 text-left justify-start hover:bg-indigo-600/20 border border-gray-700/50 hover:border-indigo-400/50 transition-all duration-200 group"
                    onClick={() => onQuickStart(prompt)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Send className="w-4 h-4 text-gray-400 group-hover:text-indigo-300 mt-0.5 flex-shrink-0 transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {prompt}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-800"
        >
          <p className="text-sm text-gray-500">
            Start typing in the message box below to begin your conversation
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}