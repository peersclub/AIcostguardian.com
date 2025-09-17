'use client'

import React from 'react'
import { Info, Zap, DollarSign, Shield, Users, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface InfoPanelProps {
  subscription?: 'FREE' | 'PRO' | 'ENTERPRISE'
  usage?: {
    dailyTokens: number
    dailyLimit: number
    monthlyCost: number
    monthlyBudget: number
  }
  activeCollaborators?: number
  currentModel?: string
  estimatedCost?: number
  className?: string
}

export function InfoPanel({
  subscription = 'FREE',
  usage,
  activeCollaborators = 0,
  currentModel,
  estimatedCost,
  className
}: InfoPanelProps) {
  const subscriptionColors = {
    FREE: 'text-gray-400 bg-gray-800',
    PRO: 'text-blue-400 bg-blue-950',
    ENTERPRISE: 'text-purple-400 bg-purple-950'
  }

  const tips = [
    "Use Focus mode for balanced performance",
    "Coding mode reduces hallucinations in code",
    "Creative mode explores more possibilities",
    "Analysis mode provides detailed breakdowns",
    "Pin important conversations for quick access",
    "Invite collaborators with the Users button",
    "Archive old threads to keep organized"
  ]

  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <div className={cn("bg-gray-950 border-l border-gray-800 p-4 space-y-4", className)}>
      {/* Subscription Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Subscription</span>
          <Badge className={cn("text-[10px]", subscriptionColors[subscription])}>
            {subscription === 'ENTERPRISE' && <Shield className="w-3 h-3 mr-1" />}
            {subscription}
          </Badge>
        </div>
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-1">Usage Today</div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] text-gray-400">Tokens</span>
              </div>
              <span className="text-[10px] text-gray-300">
                {usage.dailyTokens.toLocaleString()} / {usage.dailyLimit.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-1">
              <div 
                className="bg-yellow-500 h-1 rounded-full transition-all"
                style={{ width: `${Math.min((usage.dailyTokens / usage.dailyLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span className="text-[10px] text-gray-400">Spend</span>
              </div>
              <span className="text-[10px] text-gray-300">
                ${usage.monthlyCost.toFixed(2)} / ${usage.monthlyBudget.toFixed(2)}
              </span>
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-1">
              <div 
                className={cn(
                  "h-1 rounded-full transition-all",
                  usage.monthlyCost / usage.monthlyBudget > 0.8 ? "bg-red-500" : "bg-green-500"
                )}
                style={{ width: `${Math.min((usage.monthlyCost / usage.monthlyBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Collaborators */}
      {activeCollaborators > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-gray-400">Active Now</span>
          </div>
          <span className="text-[10px] text-gray-300">{activeCollaborators} users</span>
        </div>
      )}

      {/* Current Model */}
      {currentModel && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Model</span>
          <Badge variant="outline" className="text-[10px] h-5">
            {currentModel}
          </Badge>
        </div>
      )}

      {/* Estimated Cost */}
      {estimatedCost !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Est. Cost</span>
          <span className="text-[10px] text-gray-300">
            ${estimatedCost.toFixed(4)}
          </span>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3 h-3 text-indigo-400 mt-0.5" />
          <div>
            <div className="text-[10px] text-gray-500 mb-1">Tip</div>
            <div className="text-[10px] text-gray-400 leading-relaxed">
              {randomTip}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="text-[10px] text-gray-500 mb-2">Quick Actions</div>
        <div className="space-y-1 text-[10px]">
          <div className="text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-800 rounded text-[9px]">⌘K</kbd> Quick search
          </div>
          <div className="text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-800 rounded text-[9px]">⌘N</kbd> New thread
          </div>
          <div className="text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-800 rounded text-[9px]">⌘/</kbd> Commands
          </div>
        </div>
      </div>
    </div>
  )
}