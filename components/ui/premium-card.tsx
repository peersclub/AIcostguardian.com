'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'dark'
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ 
    className,
    variant = 'default',
    hover = true,
    glow = false,
    padding = 'lg',
    children,
    ...props
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }

    const variantClasses = {
      default: 'bg-white border border-gray-200/50 shadow-xl',
      glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl',
      gradient: 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200/30 shadow-xl',
      dark: 'bg-gray-900/90 backdrop-blur-xl border border-white/10 text-white shadow-2xl'
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={hover ? { 
          y: -8,
          transition: { duration: 0.3 }
        } : undefined}
        className={cn(
          'rounded-2xl transition-all duration-500',
          paddingClasses[padding],
          variantClasses[variant],
          hover && 'hover:shadow-2xl',
          glow && 'glow',
          className
        )}
        onClick={props.onClick}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        id={props.id}
        role={props.role}
        style={props.style}
      >
        {children}
      </motion.div>
    )
  }
)

PremiumCard.displayName = 'PremiumCard'

interface PremiumCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  iconColor?: string
  title: string
  subtitle?: string
  badge?: React.ReactNode
}

export const PremiumCardHeader = React.forwardRef<HTMLDivElement, PremiumCardHeaderProps>(
  ({ className, icon: Icon, iconColor, title, subtitle, badge, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('mb-6', className)} {...props}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {Icon && (
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={cn(
                  'p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10',
                  iconColor
                )}
              >
                <Icon className="w-6 h-6 text-purple-600" />
              </motion.div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {badge}
        </div>
      </div>
    )
  }
)

PremiumCardHeader.displayName = 'PremiumCardHeader'

interface PremiumCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const PremiumCardContent = React.forwardRef<HTMLDivElement, PremiumCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    )
  }
)

PremiumCardContent.displayName = 'PremiumCardContent'

interface PremiumCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  separator?: boolean
}

export const PremiumCardFooter = React.forwardRef<HTMLDivElement, PremiumCardFooterProps>(
  ({ className, children, separator = true, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          'mt-6',
          separator && 'pt-6 border-t border-gray-200/50',
          className
        )} 
        {...props}
      >
        {children}
      </div>
    )
  }
)

PremiumCardFooter.displayName = 'PremiumCardFooter'