import { useState, useEffect } from 'react'
import { apiKeyManager } from '@/lib/api-key-manager'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export interface KeyStatus {
  valid: boolean
  count: number
  lastChecked?: Date
  error?: string
}

export interface KeyStatusMap {
  [provider: string]: KeyStatus
}

export const useGlobalKeyCheck = () => {
  const { data: session } = useSession()
  const [keyStatus, setKeyStatus] = useState<KeyStatusMap>({})
  const [checking, setChecking] = useState(true)
  const [hasValidKeys, setHasValidKeys] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      // Initial check
      checkAllKeys()
      
      // Set up periodic refresh (every 5 minutes)
      const interval = setInterval(checkAllKeys, 5 * 60 * 1000)
      
      return () => clearInterval(interval)
    }
  }, [session])

  const checkProvider = async (provider: string): Promise<KeyStatus> => {
    if (!session?.user?.id) {
      return { valid: false, count: 0 }
    }

    try {
      const keys = await apiKeyManager.getKeys(session.user.id, provider)
      const activeKeys = keys.filter(k => k.isActive)
      
      return {
        valid: activeKeys.length > 0,
        count: activeKeys.length,
        lastChecked: new Date()
      }
    } catch (error) {
      return {
        valid: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Check failed'
      }
    }
  }

  const checkAllKeys = async () => {
    if (!session?.user?.id) return
    
    setChecking(true)
    
    try {
      // Parallel check for all providers
      const providers = ['openai', 'anthropic', 'google', 'xai', 'perplexity']
      const checks = await Promise.allSettled(
        providers.map(provider => checkProvider(provider))
      )
      
      const status: KeyStatusMap = {}
      let hasAnyValid = false
      
      providers.forEach((provider, index) => {
        const result = checks[index]
        if (result.status === 'fulfilled') {
          status[provider] = result.value
          if (result.value.valid) {
            hasAnyValid = true
          }
        } else {
          status[provider] = {
            valid: false,
            count: 0,
            error: 'Check failed'
          }
        }
      })
      
      setKeyStatus(status)
      setHasValidKeys(hasAnyValid)
      
      // Check for warnings
      const invalidProviders = Object.entries(status)
        .filter(([_, s]) => !s.valid)
        .map(([p]) => p)
      
      if (invalidProviders.length > 0 && hasAnyValid) {
        // Some providers missing keys
        console.log(`Missing API keys for: ${invalidProviders.join(', ')}`)
      } else if (!hasAnyValid) {
        // No valid keys at all
        console.log('No valid API keys found. Please add API keys to use AI features.')
      }
      
      // Store in localStorage for cross-tab sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('keyStatus', JSON.stringify({
          status,
          timestamp: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Failed to check API keys:', error)
    } finally {
      setChecking(false)
    }
  }

  const getProviderStatus = (provider: string): KeyStatus => {
    return keyStatus[provider] || { valid: false, count: 0 }
  }

  const hasProvider = (provider: string): boolean => {
    return keyStatus[provider]?.valid || false
  }

  const getAvailableProviders = (): string[] => {
    return Object.entries(keyStatus)
      .filter(([_, status]) => status.valid)
      .map(([provider]) => provider)
  }

  return {
    keyStatus,
    checking,
    hasValidKeys,
    refresh: checkAllKeys,
    getProviderStatus,
    hasProvider,
    getAvailableProviders
  }
}