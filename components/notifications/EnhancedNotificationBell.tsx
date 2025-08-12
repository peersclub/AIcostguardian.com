'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  DollarSign,
  Key,
  Users,
  Package,
  Activity,
  Settings,
  ArrowRight,
  Check,
  Clock,
  Trash2,
  Archive,
  MoreHorizontal,
  CheckCheck,
  Filter,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  BellOff,
  Search,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { 
  notificationService, 
  NotificationData, 
  NotificationEvent 
} from '@/lib/services/notification-socket.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const iconMap = {
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'info': Info,
  'dollar-sign': DollarSign,
  'key': Key,
  'users': Users,
  'package': Package,
  'activity': Activity,
  'settings': Settings,
  'x-circle': X,
  'shield': Shield,
  'zap': Zap,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
}

const eventIcons: Record<NotificationEvent, any> = {
  // API Key Events
  [NotificationEvent.API_KEY_CREATED]: Key,
  [NotificationEvent.API_KEY_UPDATED]: Key,
  [NotificationEvent.API_KEY_DELETED]: Key,
  [NotificationEvent.API_KEY_EXPIRING]: AlertTriangle,
  [NotificationEvent.API_KEY_EXPIRED]: AlertCircle,
  
  // User Events
  [NotificationEvent.USER_CREATED]: Users,
  [NotificationEvent.USER_UPDATED]: Users,
  [NotificationEvent.USER_DELETED]: Users,
  [NotificationEvent.USER_ROLE_CHANGED]: Users,
  [NotificationEvent.USER_JOINED_ORG]: Users,
  
  // Organization Events
  [NotificationEvent.ORG_CREATED]: Package,
  [NotificationEvent.ORG_UPDATED]: Package,
  [NotificationEvent.ORG_SUBSCRIPTION_CHANGED]: Package,
  [NotificationEvent.ORG_LIMIT_WARNING]: AlertTriangle,
  [NotificationEvent.ORG_LIMIT_EXCEEDED]: AlertCircle,
  
  // Cost & Usage Events
  [NotificationEvent.COST_THRESHOLD_WARNING]: TrendingUp,
  [NotificationEvent.COST_THRESHOLD_CRITICAL]: TrendingUp,
  [NotificationEvent.COST_THRESHOLD_EXCEEDED]: DollarSign,
  [NotificationEvent.DAILY_COST_SPIKE]: TrendingUp,
  [NotificationEvent.UNUSUAL_SPENDING_PATTERN]: DollarSign,
  
  // API Testing Events
  [NotificationEvent.API_TEST_STARTED]: Activity,
  [NotificationEvent.API_TEST_COMPLETED]: CheckCircle,
  [NotificationEvent.API_TEST_FAILED]: AlertCircle,
  [NotificationEvent.API_PROVIDER_OUTAGE]: AlertCircle,
  [NotificationEvent.API_RATE_LIMIT_WARNING]: AlertTriangle,
  [NotificationEvent.API_RATE_LIMIT_EXCEEDED]: AlertCircle,
  
  // Thread Events
  [NotificationEvent.THREAD_SHARED]: Users,
  [NotificationEvent.THREAD_COLLABORATION_INVITE]: Users,
  [NotificationEvent.THREAD_MESSAGE_RECEIVED]: Activity,
  
  // System Events
  [NotificationEvent.SYSTEM_UPDATE]: Info,
  [NotificationEvent.MAINTENANCE_SCHEDULED]: Clock,
  [NotificationEvent.SECURITY_ALERT]: Shield,
}

interface EnhancedNotificationBellProps {
  className?: string
}

export function EnhancedNotificationBell({ className }: EnhancedNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'critical'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bellAnimation = useAnimation()

  useEffect(() => {
    // Load notifications from API
    fetchNotifications()

    // Subscribe to real-time updates
    const unsubscribeUnread = notificationService.onUnreadCountChange(setUnreadCount)
    
    const unsubscribeNew = notificationService.on('*', (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep max 50
      setHasNewNotification(true)
      
      // Trigger bell animation
      bellAnimation.start({
        rotate: [0, -15, 15, -15, 15, 0],
        scale: [1, 1.2, 1],
        transition: { duration: 0.6, ease: "easeInOut" }
      })
      
      setTimeout(() => setHasNewNotification(false), 3000)
    })

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      unsubscribeUnread()
      unsubscribeNew()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [bellAnimation])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications?limit=20')
      const data = await response.json()
      if (data.data) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    notificationService.markAsRead(notificationId)
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, status: 'READ' } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })))
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleArchive = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/archive`, { method: 'POST' })
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to archive notification:', error)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    // Tab filtering
    if (selectedTab === 'unread' && (n as any).status === 'READ') return false
    if (selectedTab === 'critical' && n.priority !== 'CRITICAL' && n.priority !== 'HIGH') return false
    
    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return n.title.toLowerCase().includes(query) || 
             n.message.toLowerCase().includes(query)
    }
    
    return true
  })

  const hasCritical = notifications.some(n => n.priority === 'CRITICAL' && (n as any).status !== 'READ')
  const hasHigh = notifications.some(n => n.priority === 'HIGH' && (n as any).status !== 'READ')

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'from-red-500/20 to-red-600/10 dark:from-red-500/30 dark:to-red-600/20'
      case 'HIGH':
        return 'from-orange-500/20 to-orange-600/10 dark:from-orange-500/30 dark:to-orange-600/20'
      case 'MEDIUM':
        return 'from-blue-500/20 to-blue-600/10 dark:from-blue-500/30 dark:to-blue-600/20'
      default:
        return 'from-gray-500/10 to-gray-600/5 dark:from-gray-500/20 dark:to-gray-600/10'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }
      case 'HIGH':
        return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' }
      case 'MEDIUM':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800/30', text: 'text-gray-600 dark:text-gray-400' }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button with Dark Glassmorphic Styling */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={bellAnimation}
        className={cn(
          "relative p-2.5 rounded-xl transition-all duration-300",
          "bg-gradient-to-br from-indigo-500/10 to-purple-500/10",
          "hover:from-indigo-500/20 hover:to-purple-500/20",
          "border border-indigo-500/20 hover:border-indigo-400/40",
          "backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-indigo-500/10",
          hasCritical && "ring-2 ring-red-500/50 ring-offset-2 ring-offset-black animate-pulse",
          hasHigh && !hasCritical && "ring-2 ring-orange-500/50 ring-offset-2 ring-offset-black",
          className
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell 
          className={cn(
            "w-5 h-5 transition-all duration-300",
            unreadCount > 0 ? "text-indigo-400" : "text-indigo-300/60",
            hasCritical && "text-red-400",
            hasHigh && !hasCritical && "text-orange-400"
          )}
        />

        {/* Animated Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5",
                "flex items-center justify-center",
                "text-xs font-bold text-white rounded-full",
                "shadow-lg",
                hasCritical ? "bg-gradient-to-br from-red-500 to-red-600" : 
                hasHigh ? "bg-gradient-to-br from-orange-500 to-orange-600" :
                "bg-gradient-to-br from-indigo-500 to-purple-500"
              )}
            >
              <motion.span
                key={unreadCount}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Notification Pulse */}
        <AnimatePresence>
          {hasNewNotification && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: 2 }}
              className="absolute inset-0 rounded-xl bg-indigo-500/50"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Enhanced Dropdown Panel with Dark Glassmorphic Design */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-3 w-[460px] z-50"
          >
            {/* Solid black background with gradient overlay - exactly like dashboard */}
            <div className="bg-black rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20 pointer-events-none" />
              
              <div className="relative pb-3 bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl rounded-t-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                      <Bell className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Notifications</h3>
                      <p className="text-xs text-indigo-300/80">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleMarkAllAsRead}
                      className="h-8 w-8 p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-400/40 transition-all"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4 text-indigo-400" />
                    </motion.button>
                    <Link href="/notifications/settings">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="h-8 w-8 p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-400/40 transition-all"
                      >
                        <Settings className="h-4 w-4 text-indigo-400" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/40 transition-all"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400/60" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-black/30 text-white placeholder-indigo-400/40 border border-indigo-500/30 rounded-xl focus:border-indigo-400/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Enhanced Tabs */}
                <div className="mt-3 flex bg-black/30 rounded-xl p-1 border border-indigo-500/20">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTab('all')}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      selectedTab === 'all' 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg" 
                        : "text-indigo-300/60 hover:text-indigo-300"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1">
                      All
                      <span className="ml-1 px-1.5 py-0 text-xs bg-black/30 rounded-full">
                        {notifications.length}
                      </span>
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTab('unread')}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      selectedTab === 'unread' 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg" 
                        : "text-indigo-300/60 hover:text-indigo-300"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Unread
                      {unreadCount > 0 && (
                        <span className="ml-1 px-1.5 py-0 text-xs bg-indigo-500/30 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTab('critical')}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      selectedTab === 'critical' 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg" 
                        : "text-indigo-300/60 hover:text-indigo-300"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Critical
                      {hasCritical && (
                        <span className="ml-1 px-1.5 py-0 text-xs bg-red-500/30 rounded-full animate-pulse">
                          !
                        </span>
                      )}
                    </span>
                  </motion.button>
                </div>
              </div>

              <div className="relative p-0 bg-black">
                <div className="h-[420px] overflow-y-auto relative">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-indigo-500/10 rounded animate-pulse" />
                            <div className="h-3 w-full bg-indigo-500/10 rounded animate-pulse" />
                            <div className="h-3 w-1/4 bg-indigo-500/10 rounded animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 text-center"
                    >
                      <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mb-4">
                        <BellOff className="w-8 h-8 text-indigo-400/60" />
                      </div>
                      <p className="text-sm font-medium text-white mb-1">
                        {searchQuery ? 'No matches found' : 
                         selectedTab === 'unread' ? 'No unread notifications' : 
                         selectedTab === 'critical' ? 'No critical alerts' :
                         'No notifications yet'}
                      </p>
                      <p className="text-xs text-indigo-300/60">
                        {searchQuery ? 'Try a different search term' : 'Check back later for updates'}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {filteredNotifications.map((notification, index) => {
                        const Icon = notification.icon 
                          ? iconMap[notification.icon as keyof typeof iconMap]
                          : eventIcons[notification.type as NotificationEvent] || Info
                        
                        const isUnread = (notification as any).status !== 'READ'
                        
                        const getPriorityColors = (priority: string) => {
                          switch (priority) {
                            case 'CRITICAL':
                              return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
                            case 'HIGH':
                              return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' }
                            case 'MEDIUM':
                              return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' }
                            default:
                              return { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' }
                          }
                        }
                        
                        const priorityColors = getPriorityColors(notification.priority)
                        
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "mx-2 px-4 py-3 transition-all duration-200 cursor-pointer rounded-xl",
                              "bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl",
                              "border border-indigo-500/20 hover:border-indigo-400/40",
                              "relative group",
                              isUnread && "ring-1 ring-indigo-500/30"
                            )}
                          >
                            {/* Unread Indicator Line */}
                            {isUnread && (
                              <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                className={cn(
                                  "absolute left-0 top-0 bottom-0 w-1",
                                  notification.priority === 'CRITICAL' ? "bg-red-500" :
                                  notification.priority === 'HIGH' ? "bg-orange-500" :
                                  notification.priority === 'MEDIUM' ? "bg-blue-500" :
                                  "bg-indigo-500"
                                )}
                              />
                            )}

                            <div className="flex gap-3 pl-2">
                              {/* Animated Icon */}
                              <motion.div 
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className={cn(
                                  "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border",
                                  priorityColors.bg,
                                  priorityColors.border
                                )}
                              >
                                <Icon className={cn("w-5 h-5", priorityColors.text)} />
                              </motion.div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className={cn(
                                        "text-sm font-medium text-white leading-none",
                                        isUnread && "font-semibold"
                                      )}>
                                        {notification.title}
                                      </p>
                                      {isUnread && (
                                        <motion.div
                                          animate={{ scale: [1, 1.2, 1] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                          className="w-2 h-2 bg-indigo-500 rounded-full"
                                        />
                                      )}
                                    </div>
                                    <p className="text-sm text-indigo-300/60 line-clamp-2 mb-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <p className="text-xs text-indigo-300/40">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                      </p>
                                      {notification.actionUrl && (
                                        <motion.div whileHover={{ x: 3 }}>
                                          <Link
                                            href={notification.actionUrl}
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                                          >
                                            {notification.actionLabel || 'View'}
                                            <ExternalLink className="w-3 h-3" />
                                          </Link>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUnread && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="h-7 w-7 p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-400/40 transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkAsRead(notification.id)
                                    }}
                                    title="Mark as read"
                                  >
                                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                                  </motion.button>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="h-7 w-7 p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-400/40 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleArchive(notification.id)
                                  }}
                                  title="Archive"
                                >
                                  <Archive className="h-3.5 w-3.5 text-blue-400" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="h-7 w-7 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/40 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(notification.id)
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer with Quick Stats */}
                <div className="relative p-3 border-t border-indigo-500/20 bg-black">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-800/20" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span className="text-indigo-300/60">
                            {notifications.filter(n => (n as any).status !== 'READ').length} new
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-indigo-300/60">
                            {notifications.filter(n => n.priority === 'HIGH').length} high
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-indigo-300/60">
                            {notifications.filter(n => n.priority === 'CRITICAL').length} critical
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href="/notifications" className="block">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all group text-sm"
                      >
                        <span>View all notifications</span>
                        <ChevronRight className="w-4 h-4 ml-1 inline group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}