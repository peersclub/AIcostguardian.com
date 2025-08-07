'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  glow?: boolean
  gradient?: boolean
  children: React.ReactNode
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    className,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    glow = false,
    gradient = true,
    children,
    disabled,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl'
    }

    const variantClasses = {
      primary: gradient 
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl',
      secondary: 'bg-white/80 backdrop-blur text-gray-800 border border-gray-200/50 hover:bg-white/90 shadow-md hover:shadow-lg',
      ghost: 'bg-transparent hover:bg-white/10 text-gray-700 hover:text-gray-900',
      danger: gradient
        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
      success: gradient
        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl'
        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden',
          sizeClasses[size],
          variantClasses[variant],
          glow && 'glow-hover',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        onClick={props.onClick}
        onSubmit={props.onSubmit}
        type={props.type}
        name={props.name}
        value={props.value}
        form={props.form}
        formAction={props.formAction}
        formEncType={props.formEncType}
        formMethod={props.formMethod}
        formNoValidate={props.formNoValidate}
        formTarget={props.formTarget}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 -top-1/2 bg-gradient-to-b from-white/20 to-transparent"
          initial={{ x: '-100%', rotate: 30 }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
        )}

        {/* Icon and text */}
        {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
        <span className="relative z-10">{children}</span>
        {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}

        {/* Ripple effect on click */}
        <span className="absolute inset-0 rounded-xl overflow-hidden">
          <span className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300" />
        </span>
      </motion.button>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'