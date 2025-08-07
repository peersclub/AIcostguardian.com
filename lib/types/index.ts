export * from './providers'
export * from './api'
export * from './components'

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: 'admin' | 'member' | 'viewer'
  createdAt: string
  lastLogin?: string
  settings?: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  defaultProvider?: string
  dashboardLayout?: 'grid' | 'list'
  timezone?: string
  language?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  website?: string
  industry?: string
  size: 'startup' | 'scaleup' | 'enterprise'
  createdAt: string
  settings?: OrganizationSettings
}

export interface OrganizationSettings {
  allowedProviders?: string[]
  defaultLimits?: {
    monthly: number
    daily: number
    perRequest: number
  }
  approvalRequired?: boolean
  costAlerts?: {
    enabled: boolean
    thresholds: number[]
  }
  dataRetention?: number // days
}

export interface Subscription {
  id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  startDate: string
  endDate?: string
  billingCycle: 'monthly' | 'yearly'
  amount: number
  currency: string
  features: string[]
  limits: {
    adminKeys: number
    teamMembers: number
    apiRequests: number
    dataRetention: number
  }
}

export interface Feature {
  id: string
  name: string
  description: string
  enabled: boolean
  requiredPlan?: 'free' | 'pro' | 'enterprise'
  beta?: boolean
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppConfig {
  appName: string
  version: string
  environment: 'development' | 'staging' | 'production'
  apiUrl: string
  features: Record<string, boolean>
  theme: {
    defaultMode: ThemeMode
    primaryColor: string
    fontFamily: string
  }
  monitoring: {
    enabled: boolean
    service?: string
    apiKey?: string
  }
}