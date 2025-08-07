'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ProviderId, ProviderConnection, ProviderCredentials, ProviderTestResult } from '@/lib/types/providers'
import { PROVIDER_CONFIGS } from '@/lib/config/providers'
import { POLLING_INTERVALS } from '@/lib/config/constants'
import providersService from '@/lib/services/providers.service'

interface ProvidersContextValue {
  connections: Record<ProviderId, ProviderConnection>
  loading: boolean
  error: string | null
  
  // Actions
  testConnection: (providerId: ProviderId, apiKey: string) => Promise<ProviderTestResult>
  saveConnection: (credentials: ProviderCredentials) => Promise<void>
  removeConnection: (providerId: ProviderId) => Promise<void>
  refreshConnections: () => Promise<void>
  checkProviderStatus: (providerId: ProviderId) => Promise<void>
  
  // Getters
  getConnection: (providerId: ProviderId) => ProviderConnection | undefined
  isConnected: (providerId: ProviderId) => boolean
  isAdmin: (providerId: ProviderId) => boolean
  getConnectedProviders: () => ProviderId[]
}

const ProvidersContext = createContext<ProvidersContextValue | undefined>(undefined)

export const useProviders = () => {
  const context = useContext(ProvidersContext)
  if (!context) {
    throw new Error('useProviders must be used within ProvidersProvider')
  }
  return context
}

interface ProvidersProviderProps {
  children: ReactNode
  initialConnections?: Record<ProviderId, ProviderConnection>
}

export const ProvidersProvider: React.FC<ProvidersProviderProps> = ({ 
  children, 
  initialConnections = {} as Record<ProviderId, ProviderConnection>
}) => {
  const [connections, setConnections] = useState<Record<ProviderId, ProviderConnection>>(initialConnections)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all connections
  const refreshConnections = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await providersService.getConnections()
      
      if (response.success && response.data) {
        const connectionsMap: Partial<Record<ProviderId, ProviderConnection>> = {}
        response.data.forEach(connection => {
          connectionsMap[connection.providerId] = connection
        })
        setConnections(connectionsMap as Record<ProviderId, ProviderConnection>)
      } else {
        setError(response.error?.message || 'Failed to fetch connections')
      }
    } catch (err) {
      setError('Failed to fetch provider connections')
      console.error('Error fetching connections:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Test a connection
  const testConnection = useCallback(async (
    providerId: ProviderId, 
    apiKey: string
  ): Promise<ProviderTestResult> => {
    try {
      const response = await providersService.testConnection(providerId, apiKey)
      
      if (response.success && response.data) {
        return response.data
      } else {
        return {
          success: false,
          isAdmin: false,
          message: response.error?.message || 'Test failed',
          error: response.error?.message,
        }
      }
    } catch (err) {
      return {
        success: false,
        isAdmin: false,
        message: 'Connection test failed',
        error: String(err),
      }
    }
  }, [])

  // Save a connection
  const saveConnection = useCallback(async (credentials: ProviderCredentials) => {
    setLoading(true)
    setError(null)
    
    try {
      // First test the connection
      const testResult = await testConnection(credentials.providerId, credentials.apiKey)
      
      if (!testResult.success) {
        throw new Error(testResult.error || 'Invalid API key')
      }

      // Save the credentials
      const response = await providersService.saveCredentials(credentials)
      
      if (response.success) {
        // Update local state
        setConnections(prev => ({
          ...prev,
          [credentials.providerId]: {
            providerId: credentials.providerId,
            status: 'connected',
            apiKey: credentials.apiKey,
            isAdmin: testResult.isAdmin,
            lastChecked: new Date(),
          },
        }))
      } else {
        throw new Error(response.error?.message || 'Failed to save connection')
      }
    } catch (err) {
      setError(String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [testConnection])

  // Remove a connection
  const removeConnection = useCallback(async (providerId: ProviderId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await providersService.removeConnection(providerId)
      
      if (response.success) {
        setConnections(prev => {
          const updated = { ...prev }
          delete updated[providerId]
          return updated
        })
      } else {
        throw new Error(response.error?.message || 'Failed to remove connection')
      }
    } catch (err) {
      setError(String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Check provider status
  const checkProviderStatus = useCallback(async (providerId: ProviderId) => {
    try {
      const response = await providersService.checkStatus(providerId)
      
      if (response.success && response.data) {
        setConnections(prev => ({
          ...prev,
          [providerId]: response.data!,
        }))
      }
    } catch (err) {
      console.error(`Failed to check status for ${providerId}:`, err)
    }
  }, [])

  // Getters
  const getConnection = useCallback((providerId: ProviderId) => {
    return connections[providerId]
  }, [connections])

  const isConnected = useCallback((providerId: ProviderId) => {
    return connections[providerId]?.status === 'connected'
  }, [connections])

  const isAdmin = useCallback((providerId: ProviderId) => {
    return connections[providerId]?.isAdmin || false
  }, [connections])

  const getConnectedProviders = useCallback((): ProviderId[] => {
    return Object.keys(connections).filter(
      providerId => connections[providerId as ProviderId].status === 'connected'
    ) as ProviderId[]
  }, [connections])

  // Initial load
  useEffect(() => {
    refreshConnections()
  }, [refreshConnections])

  // Periodic status checks
  useEffect(() => {
    const interval = setInterval(() => {
      const connectedProviders = getConnectedProviders()
      connectedProviders.forEach(providerId => {
        checkProviderStatus(providerId)
      })
    }, POLLING_INTERVALS.STATUS_CHECK)

    return () => clearInterval(interval)
  }, [getConnectedProviders, checkProviderStatus])

  const value: ProvidersContextValue = {
    connections,
    loading,
    error,
    testConnection,
    saveConnection,
    removeConnection,
    refreshConnections,
    checkProviderStatus,
    getConnection,
    isConnected,
    isAdmin,
    getConnectedProviders,
  }

  return (
    <ProvidersContext.Provider value={value}>
      {children}
    </ProvidersContext.Provider>
  )
}