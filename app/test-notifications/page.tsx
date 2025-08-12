'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Key, 
  Users, 
  DollarSign, 
  Activity,
  Shield,
  Package,
  Zap,
  TestTube,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  Send,
  Rocket,
  PlayCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Target,
  Gauge,
  BarChart3,
  CheckCheck
} from 'lucide-react'
import { 
  notifyApiKeyCreated,
  notifyApiKeyExpiring,
  notifyCostThreshold,
  notifyApiTestResult,
  notifyUserAdded,
  notifyOrgLimitWarning,
  notificationService,
  NotificationEvent
} from '@/lib/services/notification-socket.service'

interface TestNotification {
  title: string
  description: string
  action: () => void
  type: 'success' | 'warning' | 'error' | 'info'
  icon: React.ElementType
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface TestResult {
  id: string
  timestamp: Date
  test: string
  success: boolean
  message?: string
}

export default function TestNotificationsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestingBatch, setIsTestingBatch] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const pulseAnimation = useAnimation()

  useEffect(() => {
    const checkConnection = () => {
      if (notificationService.isConnected) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 2000)

    pulseAnimation.start({
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity }
    })

    return () => clearInterval(interval)
  }, [pulseAnimation])

  const runTest = async (test: TestNotification) => {
    try {
      const result: TestResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        test: test.title,
        success: true,
        message: 'Notification sent'
      }

      test.action()
      setTestResults(prev => [result, ...prev].slice(0, 10))

      pulseAnimation.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.3 }
      })
    } catch (error) {
      const result: TestResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        test: test.title,
        success: false,
        message: 'Failed'
      }
      setTestResults(prev => [result, ...prev].slice(0, 10))
    }
  }

  const runBatchTest = async () => {
    setIsTestingBatch(true)
    setTestProgress(0)
    
    const allTests = testNotifications.slice(0, 5)
    
    for (let i = 0; i < allTests.length; i++) {
      await runTest(allTests[i])
      setTestProgress((i + 1) / allTests.length * 100)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsTestingBatch(false)
    setTestProgress(0)
  }

  const testNotifications: TestNotification[] = [
    // API Key Notifications
    {
      title: 'API Key Created',
      description: 'New API key successfully created',
      action: () => notifyApiKeyCreated('OpenAI', 'Production'),
      type: 'success',
      icon: Key,
      category: 'api-keys',
      priority: 'low'
    },
    {
      title: 'API Key Expiring',
      description: 'Key expires in 3 days',
      action: () => notifyApiKeyExpiring('Claude', 3),
      type: 'warning',
      icon: Clock,
      category: 'api-keys',
      priority: 'high'
    },
    // Cost Notifications
    {
      title: 'Cost Warning',
      description: '75% of limit reached',
      action: () => notifyCostThreshold(75, 750, 1000),
      type: 'warning',
      icon: TrendingUp,
      category: 'costs',
      priority: 'medium'
    },
    {
      title: 'Cost Critical',
      description: '95% limit reached',
      action: () => notifyCostThreshold(95, 950, 1000),
      type: 'error',
      icon: AlertTriangle,
      category: 'costs',
      priority: 'critical'
    },
    // API Testing
    {
      title: 'API Test Success',
      description: 'Connection test passed',
      action: () => notifyApiTestResult('OpenAI', true, 234),
      type: 'success',
      icon: CheckCircle,
      category: 'testing',
      priority: 'low'
    },
    {
      title: 'API Test Failed',
      description: 'Connection test failed',
      action: () => notifyApiTestResult('Gemini', false),
      type: 'error',
      icon: AlertCircle,
      category: 'testing',
      priority: 'high'
    },
    // Team
    {
      title: 'New Member',
      description: 'User joined organization',
      action: () => notifyUserAdded('John Doe', 'Developer'),
      type: 'info',
      icon: Users,
      category: 'team',
      priority: 'low'
    },
    // Organization
    {
      title: 'Org Limit Warning',
      description: '85% of resources used',
      action: () => notifyOrgLimitWarning('API Calls', 85),
      type: 'warning',
      icon: Package,
      category: 'organization',
      priority: 'high'
    },
    // System
    {
      title: 'System Update',
      description: 'Maintenance scheduled',
      action: () => {
        notificationService.emitSiteWide({
          type: NotificationEvent.SYSTEM_UPDATE,
          title: 'System Maintenance',
          message: 'Scheduled at 2 AM UTC',
          priority: 'MEDIUM',
          style: 'info',
          icon: 'info',
          actionUrl: '/status',
          actionLabel: 'View Status',
          showUntil: new Date(Date.now() + 60000),
          dismissible: true
        })
      },
      type: 'info',
      icon: Info,
      category: 'system',
      priority: 'medium'
    }
  ]

  const categories = [
    { id: 'all', label: 'All', icon: TestTube, color: 'from-indigo-500 to-purple-500' },
    { id: 'api-keys', label: 'API Keys', icon: Key, color: 'from-green-500 to-emerald-500' },
    { id: 'costs', label: 'Costs', icon: DollarSign, color: 'from-red-500 to-orange-500' },
    { id: 'testing', label: 'Testing', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { id: 'team', label: 'Team', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'organization', label: 'Org', icon: Package, color: 'from-indigo-500 to-purple-500' },
    { id: 'system', label: 'System', icon: Shield, color: 'from-yellow-500 to-orange-500' }
  ]

  const filteredNotifications = activeCategory === 'all' 
    ? testNotifications 
    : testNotifications.filter(n => n.category === activeCategory)

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl border-green-500/30 hover:border-green-400/50'
      case 'warning':
        return 'bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl border-yellow-500/30 hover:border-yellow-400/50'
      case 'error':
        return 'bg-gradient-to-br from-red-900/50 to-rose-800/50 backdrop-blur-xl border-red-500/30 hover:border-red-400/50'
      default:
        return 'bg-gradient-to-br from-blue-900/50 to-indigo-800/50 backdrop-blur-xl border-blue-500/30 hover:border-blue-400/50'
    }
  }

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs font-medium rounded-full border border-red-500/30">
            Critical
          </span>
        )
      case 'high':
        return (
          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs font-medium rounded-full border border-orange-500/30">
            High
          </span>
        )
      case 'medium':
        return (
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full border border-yellow-500/30">
            Medium
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30">
            Low
          </span>
        )
    }
  }

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  animate={pulseAnimation}
                  className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                >
                  <Bell className="h-8 w-8 text-indigo-400" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Notification Test Center
                  </h1>
                  <p className="text-indigo-300/80 mt-1">
                    Test and debug notification functionality
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Connection Status */}
                <div className={`
                  px-4 py-2 rounded-full flex items-center gap-2
                  ${connectionStatus === 'connected' 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500/20 border border-yellow-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                  }
                `}>
                  {connectionStatus === 'connected' ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">Connected</span>
                    </>
                  ) : connectionStatus === 'connecting' ? (
                    <>
                      <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
                      <span className="text-sm font-medium text-yellow-300">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">Disconnected</span>
                    </>
                  )}
                </div>

                {/* Batch Test Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={runBatchTest}
                  disabled={isTestingBatch}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {isTestingBatch ? (
                    <>
                      <RefreshCw className="inline h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="inline h-4 w-4 mr-2" />
                      Run Batch Test
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {isTestingBatch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${testProgress}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-indigo-300 mt-2">
                    Running tests... {Math.round(testProgress)}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              const count = category.id === 'all' 
                ? testNotifications.length 
                : testNotifications.filter(n => n.category === category.id).length
              
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    px-4 py-3 rounded-xl flex items-center gap-2 transition-all min-w-fit
                    ${isActive 
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg` 
                      : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{category.label}</span>
                  <span className={`
                    px-2 py-0.5 text-xs rounded-full
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-700/50 text-gray-300'
                    }
                  `}>
                    {count}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Test Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((test, index) => {
                const Icon = test.icon
                
                return (
                  <motion.div
                    key={test.title}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className={`
                      ${getCardStyle(test.type)}
                      rounded-2xl border p-6 cursor-pointer transition-all group
                    `}
                    onClick={() => runTest(test)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-black/30">
                          <Icon className={`h-5 w-5 ${getIconStyle(test.type)}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {test.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {test.category}
                            </span>
                            {getPriorityBadge(test.priority)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-4">
                      {test.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-indigo-400 group-hover:text-indigo-300">
                      <Send className="h-4 w-4 mr-2" />
                      <span>Trigger Test</span>
                      <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Test Results */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                Test Results
              </h2>
              {testResults.length > 0 && (
                <button
                  onClick={() => setTestResults([])}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <TestTube className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No test results yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <AnimatePresence>
                  {testResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`
                        p-3 rounded-lg flex items-center justify-between
                        ${result.success 
                          ? 'bg-green-900/20 border border-green-500/30' 
                          : 'bg-red-900/20 border border-red-500/30'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {result.test}
                          </p>
                          <p className="text-xs text-gray-400">
                            {result.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${result.success 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                        }
                      `}>
                        {result.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-xl rounded-xl border border-green-500/30 p-4">
              <p className="text-xs text-green-400 mb-1">Socket Status</p>
              <p className="text-2xl font-bold text-white">
                {connectionStatus === 'connected' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4">
              <p className="text-xs text-blue-400 mb-1">Test Types</p>
              <p className="text-2xl font-bold text-white">{testNotifications.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
              <p className="text-xs text-purple-400 mb-1">Categories</p>
              <p className="text-2xl font-bold text-white">{categories.length - 1}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/30 backdrop-blur-xl rounded-xl border border-indigo-500/30 p-4">
              <p className="text-xs text-indigo-400 mb-1">Tests Run</p>
              <p className="text-2xl font-bold text-white">{testResults.length}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}