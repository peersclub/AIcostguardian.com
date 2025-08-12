'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Settings, RefreshCw, CheckCheck, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=20')
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchNotifications()
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const filteredNotifications = notifications.filter(n => 
    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <Bell className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    Notification Center
                  </h1>
                </div>
                <p className="text-lg text-indigo-300/80">
                  Stay updated with real-time alerts and system notifications
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white font-medium rounded-xl border border-indigo-500/30 hover:border-indigo-400/50 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`inline h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white font-medium rounded-xl border border-indigo-500/30 hover:border-indigo-400/50 transition-all"
                >
                  <CheckCheck className="inline h-4 w-4 mr-2" />
                  Mark All Read
                </motion.button>
                
                <Link href="/notifications/settings">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                  >
                    <Settings className="inline h-4 w-4 mr-2" />
                    Settings
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/30 text-white placeholder-gray-400 border border-indigo-500/30 rounded-xl focus:border-indigo-400/50 focus:outline-none transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white font-medium rounded-xl border border-indigo-500/30 hover:border-indigo-400/50 transition-all"
              >
                <Filter className="inline h-4 w-4 mr-2" />
                Filters
              </motion.button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No notifications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-black/30 rounded-xl border border-indigo-500/20 hover:border-indigo-400/40 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                        <Bell className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{notification.title}</h3>
                        <p className="text-sm text-indigo-300/60 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            notification.priority === 'CRITICAL' 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : notification.priority === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}