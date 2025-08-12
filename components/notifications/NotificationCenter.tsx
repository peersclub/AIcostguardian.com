'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  X, Settings, CheckCheck, Loader2, AlertCircle,
  TrendingUp, DollarSign, Shield, Users, FileText,
  Zap, AlertTriangle, Bell, BellOff
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationItem } from './NotificationItem'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  priority: string
  title: string
  message: string
  status: string
  createdAt: string
  readAt?: string
  data?: any
  groupId?: string
}

interface NotificationCenterProps {
  onClose: () => void
  onMarkAllRead: () => void
  onNotificationRead: (id: string) => void
}

const notificationIcons: Record<string, any> = {
  COST_THRESHOLD_WARNING: DollarSign,
  COST_THRESHOLD_CRITICAL: AlertTriangle,
  COST_THRESHOLD_EXCEEDED: AlertCircle,
  DAILY_COST_SPIKE: TrendingUp,
  API_RATE_LIMIT_WARNING: Zap,
  API_RATE_LIMIT_EXCEEDED: AlertCircle,
  API_KEY_EXPIRING: Shield,
  NEW_TEAM_MEMBER: Users,
  WEEKLY_COST_REPORT: FileText,
  MONTHLY_COST_REPORT: FileText,
  OPTIMIZATION_RECOMMENDATIONS: TrendingUp
}

export function NotificationCenter({ 
  onClose, 
  onMarkAllRead,
  onNotificationRead 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async (pageNum: number, tab: string) => {
    try {
      setLoading(true)
      
      let url = `/api/notifications?page=${pageNum}&limit=20`
      if (tab === 'unread') {
        url += '&status=PENDING,SENT'
      } else if (tab === 'critical') {
        url += '&priority=CRITICAL,HIGH'
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        if (pageNum === 1) {
          setNotifications(data.data)
        } else {
          setNotifications(prev => [...prev, ...data.data])
        }
        setHasMore(data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications(1, activeTab)
  }, [activeTab, fetchNotifications])

  useEffect(() => {
    if (loading) return

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
        fetchNotifications(page + 1, activeTab)
      }
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, hasMore, page, activeTab, fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ', readAt: new Date().toISOString() })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n)
        )
        onNotificationRead(id)
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    notifications.forEach(notification => {
      const date = new Date(notification.createdAt)
      
      if (date >= today) {
        groups['Today'].push(notification)
      } else if (date >= yesterday) {
        groups['Yesterday'].push(notification)
      } else if (date >= weekAgo) {
        groups['This Week'].push(notification)
      } else {
        groups['Older'].push(notification)
      }
    })

    return Object.entries(groups).filter(([_, items]) => items.length > 0)
  }

  const unreadCount = notifications.filter(n => n.status !== 'READ').length

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-96 max-h-[600px] bg-background rounded-lg shadow-xl border border-border z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Link href="/notifications/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="critical" className="flex-1">Critical</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[450px]">
          <TabsContent value={activeTab} className="m-0">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  No notifications yet
                </p>
                <p className="text-muted-foreground text-xs text-center mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {groupNotificationsByDate(notifications).map(([dateGroup, items]) => (
                  <div key={dateGroup}>
                    <div className="px-4 py-2 bg-muted">
                      <p className="text-xs font-medium text-muted-foreground">
                        {dateGroup}
                      </p>
                    </div>
                    {items.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        icon={notificationIcons[notification.type] || Bell}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ))}
                
                {hasMore && (
                  <div ref={loadMoreRef} className="py-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link href="/notifications">
          <Button variant="ghost" className="w-full text-sm">
            View all notifications
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}