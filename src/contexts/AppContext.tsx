'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Organization, Subscription, ThemeMode, AppConfig } from '@/types'
import { STORAGE_KEYS, APP_NAME, APP_VERSION } from '@/config/constants'

interface AppContextValue {
  // User & Auth
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  
  // Organization
  organization: Organization | null
  setOrganization: (org: Organization | null) => void
  
  // Subscription
  subscription: Subscription | null
  setSubscription: (sub: Subscription | null) => void
  isPro: boolean
  isEnterprise: boolean
  
  // Theme
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  
  // App Config
  config: AppConfig
  features: Record<string, boolean>
  
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  dashboardLayout: 'grid' | 'list'
  setDashboardLayout: (layout: 'grid' | 'list') => void
  
  // Actions
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
  initialUser?: User | null
  initialOrganization?: Organization | null
  initialSubscription?: Subscription | null
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialUser = null,
  initialOrganization = null,
  initialSubscription = null,
}) => {
  // User & Auth
  const [user, setUser] = useState<User | null>(initialUser)
  const [organization, setOrganization] = useState<Organization | null>(initialOrganization)
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription)
  
  // Theme
  const [theme, setThemeState] = useState<ThemeMode>('system')
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dashboardLayout, setDashboardLayoutState] = useState<'grid' | 'list'>('grid')
  
  // App Config
  const config: AppConfig = {
    appName: APP_NAME,
    version: APP_VERSION,
    environment: (process.env.NODE_ENV || 'development') as AppConfig['environment'],
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    features: {
      aiCostCalculator: true,
      teamManagement: true,
      alertsSystem: true,
      exportReports: subscription?.plan !== 'free',
      advancedAnalytics: subscription?.plan === 'enterprise',
      customIntegrations: subscription?.plan === 'enterprise',
    },
    theme: {
      defaultMode: 'system',
      primaryColor: '#3B82F6',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    monitoring: {
      enabled: process.env.NODE_ENV === 'production',
      service: process.env.NEXT_PUBLIC_MONITORING_SERVICE,
      apiKey: process.env.NEXT_PUBLIC_MONITORING_API_KEY,
    },
  }

  // Computed values
  const isAuthenticated = !!user
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise'
  const isEnterprise = subscription?.plan === 'enterprise'
  
  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load theme
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode
      if (savedTheme) {
        setThemeState(savedTheme)
      }
      
      // Load dashboard layout
      const savedLayout = localStorage.getItem(STORAGE_KEYS.DASHBOARD_LAYOUT) as 'grid' | 'list'
      if (savedLayout) {
        setDashboardLayoutState(savedLayout)
      }
      
      // Load user preferences
      const savedPrefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs)
          if (prefs.sidebarOpen !== undefined) {
            setSidebarOpen(prefs.sidebarOpen)
          }
        } catch (err) {
          console.error('Failed to parse user preferences:', err)
        }
      }
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark')
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
  }, [theme])

  // Save theme preference
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
    }
  }

  // Save dashboard layout preference
  const setDashboardLayout = (layout: 'grid' | 'list') => {
    setDashboardLayoutState(layout)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_LAYOUT, layout)
    }
  }

  // Save sidebar preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefs = {
        sidebarOpen,
      }
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs))
    }
  }, [sidebarOpen])

  // Logout action
  const logout = () => {
    setUser(null)
    setOrganization(null)
    setSubscription(null)
    
    if (typeof window !== 'undefined') {
      // Clear auth token
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      
      // Redirect to login
      window.location.href = '/auth/signin'
    }
  }

  // Refresh user data
  const refreshUserData = async () => {
    try {
      // This would call your API to refresh user, org, and subscription data
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setOrganization(data.organization)
        setSubscription(data.subscription)
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err)
    }
  }

  const value: AppContextValue = {
    // User & Auth
    user,
    isAuthenticated,
    setUser,
    
    // Organization
    organization,
    setOrganization,
    
    // Subscription
    subscription,
    setSubscription,
    isPro,
    isEnterprise,
    
    // Theme
    theme,
    setTheme,
    
    // App Config
    config,
    features: config.features,
    
    // UI State
    sidebarOpen,
    setSidebarOpen,
    dashboardLayout,
    setDashboardLayout,
    
    // Actions
    logout,
    refreshUserData,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}