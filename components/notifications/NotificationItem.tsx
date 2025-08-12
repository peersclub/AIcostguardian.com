'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MoreVertical, Check, Trash2, Eye, EyeOff, 
  ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface NotificationItemProps {
  notification: {
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
  icon: any
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

const priorityColors = {
  LOW: 'bg-muted text-foreground',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
}

const priorityBorders = {
  LOW: 'border-l-border',
  MEDIUM: 'border-l-blue-500',
  HIGH: 'border-l-orange-500',
  CRITICAL: 'border-l-red-500'
}

export function NotificationItem({ 
  notification, 
  icon: Icon,
  onMarkAsRead,
  onDelete 
}: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isRead = notification.status === 'READ' || !!notification.readAt

  const handleToggleRead = () => {
    if (!isRead) {
      onMarkAsRead(notification.id)
    }
  }

  const getActionLink = () => {
    // Generate appropriate action link based on notification type
    switch (notification.type) {
      case 'COST_THRESHOLD_WARNING':
      case 'COST_THRESHOLD_CRITICAL':
      case 'COST_THRESHOLD_EXCEEDED':
      case 'DAILY_COST_SPIKE':
        return '/dashboard'
      case 'API_RATE_LIMIT_WARNING':
      case 'API_RATE_LIMIT_EXCEEDED':
        return '/analytics/usage'
      case 'API_KEY_EXPIRING':
      case 'API_KEY_EXPIRED':
        return '/settings'
      case 'NEW_TEAM_MEMBER':
      case 'MEMBER_EXCEEDED_LIMIT':
        return '/team'
      case 'WEEKLY_COST_REPORT':
      case 'MONTHLY_COST_REPORT':
        return '/analytics/reports'
      case 'OPTIMIZATION_RECOMMENDATIONS':
        return '/monitoring/dashboard?tab=insights'
      default:
        return '/notifications'
    }
  }

  const renderAdditionalData = () => {
    if (!notification.data) return null

    const { cost, usage, provider, model, threshold, recommendation } = notification.data

    return (
      <div className="mt-3 space-y-2 text-xs">
        {cost && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost:</span>
            <span className="font-medium">${cost.toFixed(2)}</span>
          </div>
        )}
        {usage && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Usage:</span>
            <span className="font-medium">{usage.toLocaleString()} tokens</span>
          </div>
        )}
        {provider && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider:</span>
            <span className="font-medium">{provider}</span>
          </div>
        )}
        {model && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium">{model}</span>
          </div>
        )}
        {threshold && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Threshold:</span>
            <span className="font-medium">${threshold.toFixed(2)}</span>
          </div>
        )}
        {recommendation && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300">
            💡 {recommendation}
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "relative px-4 py-3 transition-all duration-200 border-l-4",
        priorityBorders[notification.priority as keyof typeof priorityBorders],
        !isRead && "bg-blue-50/50 dark:bg-blue-900/10",
        "hover:bg-muted"
      )}
      onClick={handleToggleRead}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg mt-0.5",
          notification.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30' :
          notification.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/30' :
          'bg-muted'
        )}>
          <Icon className={cn(
            "h-4 w-4",
            notification.priority === 'CRITICAL' ? 'text-red-600 dark:text-red-400' :
            notification.priority === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
            'text-muted-foreground'
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn(
                "text-sm font-medium mb-0.5",
                !isRead && "font-semibold"
              )}>
                {notification.title}
              </h4>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 mb-1",
                  priorityColors[notification.priority as keyof typeof priorityColors]
                )}
              >
                {notification.priority}
              </Badge>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                  {isRead ? (
                    <>
                      <EyeOff className="mr-2 h-3 w-3" />
                      Mark as unread
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-3 w-3" />
                      Mark as read
                    </>
                  )}
                </DropdownMenuItem>
                <Link href={getActionLink()}>
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View details
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(notification.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className={cn(
            "text-xs text-muted-foreground",
            isExpanded ? "" : "line-clamp-2"
          )}>
            {notification.message}
          </p>

          {/* Expandable content */}
          {notification.data && (
            <>
              {isExpanded && renderAdditionalData()}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1 mt-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            </>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {notification.groupId && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                Grouped
              </Badge>
            )}
            {!isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}