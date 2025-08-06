'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumStatProps {
  label: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: LucideIcon
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  prefix?: string
  suffix?: string
  description?: string
}

export const PremiumStat: React.FC<PremiumStatProps> = ({
  label,
  value,
  change,
  icon: Icon,
  color = 'purple',
  size = 'md',
  loading = false,
  prefix,
  suffix,
  description
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-teal-500',
    red: 'from-red-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500'
  }

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  const getTrendIcon = () => {
    if (!change) return null
    switch (change.trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    if (!change) return ''
    switch (change.trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Icon */}
        {Icon && (
          <div className={cn(
            'inline-flex p-3 rounded-xl mb-4',
            `bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Label */}
        <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-2">
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          ) : (
            <>
              {prefix && <span className="text-lg text-gray-500">{prefix}</span>}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(
                  'font-bold bg-gradient-to-r bg-clip-text text-transparent',
                  colorClasses[color],
                  sizeClasses[size]
                )}
              >
                {typeof value === 'number' ? value.toLocaleString() : value}
              </motion.span>
              {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
            </>
          )}
        </div>

        {/* Change indicator */}
        {change && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn('flex items-center gap-1 text-sm', getTrendColor())}
          >
            {getTrendIcon()}
            <span className="font-medium">
              {change.value > 0 ? '+' : ''}{change.value}%
            </span>
          </motion.div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}

        {/* Decorative gradient line */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r',
          colorClasses[color]
        )} />
      </div>
    </motion.div>
  )
}

interface PremiumStatsGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export const PremiumStatsGrid: React.FC<PremiumStatsGridProps> = ({
  children,
  columns = 4,
  className
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn(
      'grid gap-6',
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  )
}