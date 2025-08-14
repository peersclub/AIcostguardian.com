'use client'

import React from 'react'
import { Sparkles, Code, Palette, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OptimizationMode = 'focus' | 'coding' | 'creative' | 'analysis'

interface ModeSelectorProps {
  currentMode: OptimizationMode
  onModeChange: (mode: OptimizationMode) => void
  compact?: boolean
}

const modeConfigs = {
  focus: {
    id: 'focus',
    name: 'Focus',
    icon: Sparkles,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Balanced performance for general tasks',
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      preferredModels: ['gpt-4o', 'claude-3-5-sonnet'],
      systemPrompt: 'You are a helpful assistant focused on providing clear, accurate, and concise responses.'
    }
  },
  coding: {
    id: 'coding',
    name: 'Coding',
    icon: Code,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Optimized for code generation and debugging',
    settings: {
      temperature: 0.3,
      maxTokens: 4096,
      topP: 0.95,
      preferredModels: ['gpt-4o', 'claude-3-opus'],
      systemPrompt: 'You are an expert programmer. Provide clean, efficient, and well-documented code with explanations.'
    }
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    icon: Palette,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Enhanced creativity for brainstorming and ideation',
    settings: {
      temperature: 0.9,
      maxTokens: 2048,
      topP: 0.95,
      preferredModels: ['claude-3-opus', 'gpt-4o'],
      systemPrompt: 'You are a creative thinker. Generate innovative ideas, unique perspectives, and imaginative solutions.'
    }
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis',
    icon: Brain,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Deep analysis and detailed reasoning',
    settings: {
      temperature: 0.4,
      maxTokens: 4096,
      topP: 0.9,
      preferredModels: ['claude-3-opus', 'gpt-4o'],
      systemPrompt: 'You are an analytical expert. Provide thorough analysis, detailed breakdowns, and evidence-based reasoning.'
    }
  }
}

export function ModeSelector({ currentMode, onModeChange, compact = false }: ModeSelectorProps) {
  const currentConfig = modeConfigs[currentMode]

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {Object.entries(modeConfigs).map(([mode, config]) => {
          const Icon = config.icon
          const isActive = currentMode === mode
          
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode as OptimizationMode)}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                isActive ? cn(config.bgColor, config.borderColor, "border") : "hover:bg-gray-800/50",
                config.color
              )}
              title={config.description}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {Object.entries(modeConfigs).map(([mode, config]) => {
        const Icon = config.icon
        const isActive = currentMode === mode
        
        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode as OptimizationMode)}
            className={cn(
              "p-3 rounded-lg border transition-all",
              isActive 
                ? cn(config.bgColor, config.borderColor, "border-2") 
                : "border-gray-800 hover:border-gray-700 hover:bg-gray-900/50"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className={cn("w-5 h-5", config.color)} />
              <div>
                <div className={cn(
                  "text-sm font-medium",
                  isActive ? config.color : "text-gray-400"
                )}>
                  {config.name}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  {config.description}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function getModeSettings(mode: OptimizationMode) {
  return modeConfigs[mode].settings
}

export function getModeConfig(mode: OptimizationMode) {
  return modeConfigs[mode]
}