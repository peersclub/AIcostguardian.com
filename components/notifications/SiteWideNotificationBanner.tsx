'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  ArrowRight,
  Megaphone,
  Zap,
  DollarSign,
  Shield,
  Users,
  Key,
  Package,
  Activity,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { notificationService, SiteWideNotification } from '@/lib/services/notification-socket.service'
import Link from 'next/link'

const iconMap = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'info': Info,
  'check-circle': CheckCircle,
  'megaphone': Megaphone,
  'zap': Zap,
  'dollar-sign': DollarSign,
  'shield': Shield,
  'users': Users,
  'key': Key,
  'package': Package,
  'activity': Activity,
  'clock': Clock,
}

export function SiteWideNotificationBanner() {
  const [notifications, setNotifications] = useState<SiteWideNotification[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load dismissed IDs from localStorage
    const stored = localStorage.getItem('dismissed-site-notifications')
    if (stored) {
      setDismissedIds(new Set(JSON.parse(stored)))
    }

    // Subscribe to site-wide notifications
    const unsubscribe = notificationService.onSiteWide((notifs) => {
      setNotifications(notifs)
    })

    return unsubscribe
  }, [])

  const handleDismiss = (notification: SiteWideNotification) => {
    const newDismissedIds = new Set(dismissedIds)
    newDismissedIds.add(notification.id)
    setDismissedIds(newDismissedIds)
    
    // Save to localStorage
    localStorage.setItem('dismissed-site-notifications', JSON.stringify(Array.from(newDismissedIds)))
    
    // Notify service
    notificationService.dismissSiteWideNotification(notification.id)
  }

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(n => 
    !dismissedIds.has(n.id) && 
    (!n.expiresAt || new Date(n.expiresAt) > new Date())
  )

  // Get the most important notification to display
  const currentNotification = visibleNotifications.sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })[0]

  if (!currentNotification) return null

  const Icon = currentNotification.icon ? iconMap[currentNotification.icon as keyof typeof iconMap] : Info
  
  const bannerStyles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  }

  const iconStyles = {
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    error: 'text-red-500 dark:text-red-400',
    success: 'text-green-500 dark:text-green-400',
  }

  const style = currentNotification.style || 
    (currentNotification.priority === 'CRITICAL' ? 'error' :
     currentNotification.priority === 'HIGH' ? 'warning' :
     currentNotification.priority === 'MEDIUM' ? 'info' : 'info')

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentNotification.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative overflow-hidden"
      >
        <div className={cn(
          'border-b px-4 py-3 relative',
          bannerStyles[style]
        )}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Animated Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: currentNotification.priority === 'CRITICAL' ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: 2,
                  repeat: currentNotification.priority === 'CRITICAL' ? Infinity : 0,
                  repeatDelay: 1
                }}
              >
                <Icon className={cn('w-5 h-5', currentNotification.iconColor || iconStyles[style])} />
              </motion.div>

              {/* Notification Content */}
              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold">{currentNotification.title}</span>
                <span className="hidden sm:inline opacity-90">{currentNotification.message}</span>
                
                {/* Action Link */}
                {currentNotification.actionUrl && (
                  <Link
                    href={currentNotification.actionUrl}
                    className={cn(
                      'ml-auto flex items-center gap-1 px-3 py-1 rounded-md',
                      'font-medium text-sm transition-all',
                      'hover:bg-white/20 dark:hover:bg-black/20'
                    )}
                  >
                    {currentNotification.actionLabel || 'View'}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Additional notifications indicator */}
              {visibleNotifications.length > 1 && (
                <div className="flex items-center gap-1 ml-4">
                  <span className="text-xs opacity-70">
                    +{visibleNotifications.length - 1} more
                  </span>
                  <div className="flex gap-1">
                    {visibleNotifications.slice(1, 4).map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          n.priority === 'CRITICAL' ? 'bg-destructive' :
                          n.priority === 'HIGH' ? 'bg-orange-500' :
                          n.priority === 'MEDIUM' ? 'bg-primary' :
                          'bg-muted-foreground'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {currentNotification.dismissible !== false && (
              <button
                onClick={() => handleDismiss(currentNotification)}
                className={cn(
                  'ml-4 p-1 rounded-md transition-all',
                  'hover:bg-white/20 dark:hover:bg-black/20'
                )}
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress bar for expiring notifications */}
          {currentNotification.showUntil && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ 
                duration: Math.max(0, new Date(currentNotification.showUntil).getTime() - Date.now()) / 1000,
                ease: 'linear'
              }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}