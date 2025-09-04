'use client'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Key, 
  Plus, 
  MoreVertical, 
  TestTube, 
  Trash2, 
  RefreshCw,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Globe,
  Zap
} from 'lucide-react'
import { apiKeyManager, KeyType, ApiKey } from '@/lib/api-key-manager'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

interface KeyDetailsModalProps {
  apiKey: ApiKey | null
  onClose: () => void
}

const KeyDetailsModal = ({ apiKey, onClose }: KeyDetailsModalProps) => {
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  if (!apiKey) return null

  const handleTest = async () => {
    setTesting(true)
    try {
      // Use dedicated test endpoint
      const response = await fetch('/api/api-keys/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: apiKey.id,
          provider: apiKey.provider.toLowerCase()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to test API key')
      }

      const result = await response.json()
      setTestResult(result)
      
      if (result.success) {
        toast.success('Key test successful!')
      } else {
        toast.error(`Test failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('API key test error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to test key'
      toast.error(errorMessage)
      setTestResult({ success: false, error: errorMessage })
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey.encryptedKey)
    toast.success('Key copied to clipboard')
  }

  return (
    <Dialog open={!!apiKey} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>API Key Details</DialogTitle>
          <DialogDescription>
            Manage and test your {apiKey.provider} API key
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">API Key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm text-foreground">
                  {showKey ? apiKey.encryptedKey : '••••••••••••••••••••'}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium text-foreground">{apiKey.provider}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge variant={apiKey.type === KeyType.ADMIN ? 'destructive' : 'default'}>
                {apiKey.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-1">
                {apiKey.isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">Inactive</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Used</p>
              <p className="font-medium text-foreground">
                {apiKey.lastUsed ? format(apiKey.lastUsed, 'PPp') : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Tested</p>
              <p className="font-medium text-foreground">
                {apiKey.lastTested ? format(apiKey.lastTested, 'PPp') : 'Never'}
              </p>
            </div>
          </div>

          {apiKey.metadata && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Metadata</p>
              <pre className="p-3 bg-muted rounded-lg text-xs overflow-auto text-foreground">
                {JSON.stringify(apiKey.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? (
                <>Testing...</>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Key
                </>
              )}
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>

          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              <AlertTitle>Test Result</AlertTitle>
              <AlertDescription>
                {testResult.success ? (
                  <div className="space-y-1">
                    <p>✓ Key is working correctly</p>
                    {testResult.model && (
                      <p className="text-sm">Model Access: {testResult.model}</p>
                    )}
                    {testResult.provider && (
                      <p className="text-sm">Provider: {testResult.provider}</p>
                    )}
                  </div>
                ) : (
                  <p>✗ {testResult.error || 'Test failed'}</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ApiKeyListProps {
  keys: ApiKey[]
  onViewDetails: (key: ApiKey) => void
  onDelete: (key: ApiKey) => void
  badge?: string
  description?: string
  warningMessage?: string
}

const ApiKeyList = ({ 
  keys, 
  onViewDetails, 
  onDelete,
  badge,
  description,
  warningMessage
}: ApiKeyListProps) => {
  return (
    <div className="space-y-4">
      {description && (
        <p className="text-sm text-gray-400">{description}</p>
      )}
      
      {warningMessage && (
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-800/30 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <p className="text-yellow-300 text-sm">{warningMessage}</p>
          </div>
        </div>
      )}

      {keys.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-800/50 rounded-full mb-4">
              <Key className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-300 text-lg">No {badge?.toLowerCase()} keys added yet</p>
            <p className="text-gray-500 text-sm mt-2">Click "Add New Key" to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {keys.map((key, index) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Key className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{key.provider}</p>
                        {badge && (
                          <Badge 
                            className={key.type === KeyType.ADMIN ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-gray-700/50 text-gray-300 border-gray-600'}
                          >
                            {badge}
                          </Badge>
                        )}
                        {key.isActive ? (
                          <Badge className="text-green-400 border-green-500/30 bg-green-500/10">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="text-red-400 border-red-500/30 bg-red-500/10">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        {key.createdAt && (
                          <span>Added {format(new Date(key.createdAt), 'PP')}</span>
                        )}
                        {key.lastUsed && (
                          <span>Last used {format(new Date(key.lastUsed), 'PP')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 border-0" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                      <DropdownMenuItem onClick={() => onViewDetails(key)} className="text-gray-300 hover:bg-gray-800">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/api-keys/test', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: key.id,
                                provider: key.provider.toLowerCase()
                              })
                            })
                            
                            if (response.ok) {
                              const result = await response.json()
                              if (result.success) {
                                toast.success(`${key.provider} key test successful!`)
                              } else {
                                toast.error(`${key.provider} test failed: ${result.error}`)
                              }
                            } else {
                              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                              toast.error(`Failed to test key: ${errorData.error}`)
                            }
                          } catch (error) {
                            toast.error('Failed to test key')
                          }
                        }} 
                        className="text-gray-300 hover:bg-gray-800"
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Key
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(key)}
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ApiKeysSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['all', 'openai', 'anthropic', 'google'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    loadKeys()
  }, [session])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/settings/api-keys?tab=${value}`)
  }

  const loadKeys = async () => {
    setLoading(true)
    try {
      // Pass empty string as userId since the API will use the session
      const userKeys = await apiKeyManager.getKeys('')
      setKeys(userKeys)
    } catch (error) {
      console.error('Failed to load keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Refresh will validate all keys
      await loadKeys()
      toast.success('API keys refreshed')
    } catch (error) {
      toast.error('Failed to refresh keys')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async (key: ApiKey) => {
    if (confirm(`Are you sure you want to delete this ${key.provider} API key?`)) {
      try {
        const response = await fetch(`/api/api-keys?id=${key.id}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error('Failed to delete key')
        }
        await loadKeys()
        toast.success('API key deleted')
      } catch (error) {
        toast.error('Failed to delete key')
      }
    }
  }

  const usageKeys = keys.filter(k => k.type === KeyType.USAGE_TRACKING)
  const adminKeys = keys.filter(k => k.type === KeyType.ADMIN)
  const standardKeys = keys.filter(k => k.type === KeyType.STANDARD)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                API Key Management
              </h1>
              <p className="text-gray-400 text-lg">
                Configure and manage your AI provider API keys
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 text-gray-300 hover:bg-gray-700/50"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              <Button 
                onClick={() => router.push('/onboarding/api-setup')}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Key
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-900/50 to-purple-800/50 backdrop-blur-xl rounded-xl border border-indigo-500/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Keys</p>
                  <p className="text-2xl font-bold text-white">{keys.length}</p>
                </div>
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Key className="h-6 w-6 text-indigo-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-xl border border-green-500/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Keys</p>
                  <p className="text-2xl font-bold text-green-400">
                    {keys.filter(k => k.isActive).length}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Providers</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {new Set(keys.map(k => k.provider)).size}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Admin Keys</p>
                  <p className="text-2xl font-bold text-yellow-400">{adminKeys.length}</p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-gray-800/30 p-1 rounded-lg grid w-full grid-cols-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400">
                <Key className="h-4 w-4 mr-2" />
                All Keys
                <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
                  {keys.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400">
                <Activity className="h-4 w-4 mr-2" />
                Usage Tracking
                {usageKeys.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs">
                    {usageKeys.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400">
                <Shield className="h-4 w-4 mr-2" />
                Admin Keys
                {adminKeys.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                    {adminKeys.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="standard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400">
                <Zap className="h-4 w-4 mr-2" />
                Standard
                {standardKeys.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    {standardKeys.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

        <TabsContent value="all">
          <ApiKeyList
            keys={keys}
            onViewDetails={setSelectedKey}
            onDelete={handleDelete}
            description="All your API keys across different providers"
          />
        </TabsContent>

        <TabsContent value="usage">
          <ApiKeyList
            keys={usageKeys}
            onViewDetails={setSelectedKey}
            onDelete={handleDelete}
            badge="Usage Tracking"
            description="Keys for monitoring API usage and costs. These keys typically have read-only access."
          />
        </TabsContent>

        <TabsContent value="admin">
          <ApiKeyList
            keys={adminKeys}
            onViewDetails={setSelectedKey}
            onDelete={handleDelete}
            badge="Admin Access"
            description="Keys with full organization management capabilities."
            warningMessage="Admin keys have elevated privileges. Handle with care and rotate regularly."
          />
        </TabsContent>

        <TabsContent value="standard">
          <ApiKeyList
            keys={standardKeys}
            onViewDetails={setSelectedKey}
            onDelete={handleDelete}
            badge="Standard"
            description="Standard API keys for regular operations."
          />
        </TabsContent>
      </Tabs>

      <KeyDetailsModal
        apiKey={selectedKey}
        onClose={() => setSelectedKey(null)}
      />

        </motion.div>
      </div>
    </div>
  )
}