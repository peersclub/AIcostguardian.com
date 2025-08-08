'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  X,
  Eye,
  Clock,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { NotificationType, NotificationPriority } from '@prisma/client'

interface ToastAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline'
}

interface NotificationToastProps {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  actions?: ToastAction[]
  duration?: number // Auto-dismiss duration in ms (0 = no auto-dismiss)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showIcon?: boolean
  showPriority?: boolean
  showActions?: boolean
  persistent?: boolean
  onView?: () => void
  onDismiss?: () => void
  onSnooze?: (minutes: number) => void
  className?: string
}

interface ToastContainerProps {
  children: React.ReactNode
  position: NotificationToastProps['position']
}

const typeIcons = {
  COST_ALERT: DollarSign,
  USAGE_ALERT: TrendingUp,
  SYSTEM_ALERT: AlertCircle,
  TEAM_ALERT: Users,
  REPORT: FileText,
  RECOMMENDATION: Settings
} as const

const priorityColors = {
  LOW: {
    border: 'border-l-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
    icon: 'text-green-600 dark:text-green-400'
  },
  MEDIUM: {
    border: 'border-l-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  HIGH: {
    border: 'border-l-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  CRITICAL: {
    border: 'border-l-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400'
  }
} as const

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
} as const

const animations = {
  'top-right': {
    enter: 'animate-in slide-in-from-right-full duration-300',
    exit: 'animate-out slide-out-to-right-full duration-200'
  },
  'top-left': {
    enter: 'animate-in slide-in-from-left-full duration-300',
    exit: 'animate-out slide-out-to-left-full duration-200'
  },
  'bottom-right': {
    enter: 'animate-in slide-in-from-right-full duration-300',
    exit: 'animate-out slide-out-to-right-full duration-200'
  },
  'bottom-left': {
    enter: 'animate-in slide-in-from-left-full duration-300',
    exit: 'animate-out slide-out-to-left-full duration-200'
  },
  'top-center': {
    enter: 'animate-in slide-in-from-top-full duration-300',
    exit: 'animate-out slide-out-to-top-full duration-200'
  },
  'bottom-center': {
    enter: 'animate-in slide-in-from-bottom-full duration-300',
    exit: 'animate-out slide-out-to-bottom-full duration-200'
  }
} as const

function ToastContainer({ children, position }: ToastContainerProps) {
  return (
    <div className={cn('fixed z-50 pointer-events-none', positionClasses[position])}>
      <div className="pointer-events-auto space-y-2">
        {children}
      </div>
    </div>
  )
}

export function NotificationToast({
  id,
  type,
  priority,
  title,
  message,
  actions = [],
  duration = 5000,
  position = 'top-right',
  showIcon = true,
  showPriority = true,
  showActions = true,
  persistent = false,
  onView,
  onDismiss,
  onSnooze,
  className
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const IconComponent = typeIcons[type] || AlertCircle
  const priorityStyle = priorityColors[priority]
  const animation = animations[position]

  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0 || persistent || !isVisible) return

    const startTimer = () => {
      startTimeRef.current = Date.now()
      timerRef.current = setTimeout(() => {
        handleDismiss()
      }, timeLeft)
    }

    const pauseTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
        const elapsed = Date.now() - startTimeRef.current
        setTimeLeft(prev => Math.max(0, prev - elapsed))
      }
    }

    if (isPaused) {
      pauseTimer()
    } else {
      startTimer()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [duration, timeLeft, isPaused, isVisible, persistent])

  // Progress indicator update
  useEffect(() => {
    if (duration <= 0 || persistent || !isVisible || isPaused) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, timeLeft - elapsed)
      
      if (remaining <= 0) {
        clearInterval(interval)
        handleDismiss()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [timeLeft, isPaused, isVisible, duration, persistent])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, 200) // Match exit animation duration
  }

  const handleView = () => {
    onView?.()
    handleDismiss()
  }

  const handleSnooze = (minutes: number) => {
    onSnooze?.(minutes)
    handleDismiss()
  }

  const handleMouseEnter = () => {
    if (!persistent && duration > 0) {
      setIsPaused(true)
    }
  }

  const handleMouseLeave = () => {
    if (!persistent && duration > 0) {
      setIsPaused(false)
    }
  }

  if (!isVisible) return null

  const progress = duration > 0 && !persistent ? ((duration - (timeLeft - (isPaused ? Date.now() - startTimeRef.current : 0))) / duration) * 100 : 0

  return (
    <ToastContainer position={position}>
      <Card
        className={cn(
          'w-80 max-w-sm border-l-4 shadow-lg transition-all duration-200',
          priorityStyle.border,
          priorityStyle.bg,
          isExiting ? animation.exit : animation.enter,
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Progress bar */}
        {duration > 0 && !persistent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20 rounded-t-lg overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            {showIcon && (
              <div className="flex-shrink-0 mt-0.5">
                <IconComponent className={cn('h-5 w-5', priorityStyle.icon)} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold leading-tight">
                    {title}
                  </h4>
                  
                  {showPriority && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-0 mt-1"
                    >
                      {priority}
                    </Badge>
                  )}
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {message}
              </p>

              {/* Actions */}
              {showActions && (actions.length > 0 || onView || onSnooze) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Custom actions */}
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-7"
                    >
                      {action.label}
                    </Button>
                  ))}

                  {/* View action */}
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleView}
                      className="text-xs h-7"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}

                  {/* Snooze actions */}
                  {onSnooze && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSnooze(5)}
                        className="text-xs h-7"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        5m
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSnooze(30)}
                        className="text-xs h-7"
                      >
                        30m
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ToastContainer>
  )
}

// Toast Manager Hook
interface ToastData {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  actions?: ToastAction[]
  duration?: number
  position?: NotificationToastProps['position']
  persistent?: boolean
  onView?: () => void
  onSnooze?: (minutes: number) => void
}

let toastCounter = 0

export function useNotificationToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastCounter}`
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const clearAll = () => {
    setToasts([])
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll
  }
}

// Toast Container Component for rendering all toasts
export function NotificationToastContainer() {
  const { toasts, removeToast } = useNotificationToasts()

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right'
    if (!acc[position]) acc[position] = []
    acc[position].push(toast)
    return acc
  }, {} as Record<string, ToastData[]>)

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <ToastContainer key={position} position={position as NotificationToastProps['position']}>
          {positionToasts.map(toast => (
            <NotificationToast
              key={toast.id}
              {...toast}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </ToastContainer>
      ))}
    </>
  )
}

export default NotificationToast