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

    // Set up WebSocket for real-time updates
    const ws = setupWebSocket()

    return () => {
      if (ws) ws.close()
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

  const setupWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/notifications/websocket`)

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        
        if (message.type === 'new_notification') {
          setUnreadCount(prev => prev + 1)
          setHasNewNotification(true)
          
          // Reset animation after 1 second
          setTimeout(() => setHasNewNotification(false), 1000)
          
          if (message.data?.priority === 'CRITICAL') {
            setHasCritical(true)
          }
        } else if (message.type === 'notification_read') {
          setUnreadCount(prev => Math.max(0, prev - 1))
        } else if (message.type === 'unread_count') {
          setUnreadCount(message.count || 0)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        // Fall back to polling
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
      }

      return ws
    } catch (error) {
      console.error('Failed to setup WebSocket:', error)
      // Fall back to polling
      const interval = setInterval(fetchUnreadCount, 30000)
      return { close: () => clearInterval(interval) }
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
          "hover:bg-gray-100 dark:hover:bg-gray-800",
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
              unreadCount > 0 ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400",
              hasCritical && "text-red-600 dark:text-red-400"
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
                hasCritical ? "bg-red-500" : "bg-blue-500"
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