'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NotificationCenter } from './NotificationCenter'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [hasCritical, setHasCritical] = useState(false)

  useEffect(() => {
    // Fetch initial unread count
    fetchUnreadCount()

    // Use polling for production compatibility (Vercel doesn't support WebSocket)
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?status=PENDING,SENT&limit=0')
      const data = await response.json()
      
      if (response.headers.get('X-Unread-Count')) {
        const count = parseInt(response.headers.get('X-Unread-Count') || '0')
        setUnreadCount(count)
      }
      
      // Check for critical notifications
      const criticalResponse = await fetch('/api/notifications?priority=CRITICAL&status=PENDING,SENT&limit=1')
      const criticalData = await criticalResponse.json()
      setHasCritical(criticalData.data?.length > 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }


  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', filters: {} })
      })
      setUnreadCount(0)
      setHasCritical(false)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-200",
          "hover:bg-muted",
          hasCritical && "animate-pulse",
          className
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <motion.div
          animate={hasNewNotification ? {
            rotate: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
          } : {}}
        >
          <Bell 
            className={cn(
              "w-5 h-5 transition-colors",
              unreadCount > 0 ? "text-primary" : "text-muted-foreground",
              hasCritical && "text-destructive"
            )}
          />
        </motion.div>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "absolute -top-1 -right-1 min-w-[20px] h-5 px-1",
                "flex items-center justify-center",
                "text-xs font-bold text-white rounded-full",
                hasCritical ? "bg-destructive" : "bg-primary"
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <NotificationCenter
            onClose={() => setIsOpen(false)}
            onMarkAllRead={handleMarkAllRead}
            onNotificationRead={() => setUnreadCount(prev => Math.max(0, prev - 1))}
          />
        )}
      </AnimatePresence>
    </div>
  )
}