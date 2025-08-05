export interface SubscriptionPlan {
  id: string
  name: string
  features: {
    maxAdminKeys: number
    maxTeamMembers: number
    advancedAnalytics: boolean
    dataExport: boolean
    prioritySupport: boolean
    ssoIntegration: boolean
    unlimitedHistory: boolean
    customAlerts: boolean
  }
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    features: {
      maxAdminKeys: 1,
      maxTeamMembers: 1,
      advancedAnalytics: false,
      dataExport: false,
      prioritySupport: false,
      ssoIntegration: false,
      unlimitedHistory: false,
      customAlerts: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    features: {
      maxAdminKeys: -1, // -1 means unlimited
      maxTeamMembers: 5,
      advancedAnalytics: true,
      dataExport: true,
      prioritySupport: true,
      ssoIntegration: false,
      unlimitedHistory: true,
      customAlerts: true
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    features: {
      maxAdminKeys: -1,
      maxTeamMembers: -1,
      advancedAnalytics: true,
      dataExport: true,
      prioritySupport: true,
      ssoIntegration: true,
      unlimitedHistory: true,
      customAlerts: true
    }
  }
}

export interface UserSubscription {
  planId: string
  status: 'active' | 'inactive' | 'cancelled' | 'trial'
  trialEndsAt?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

// Mock subscription data - in real app, this would come from database
const MOCK_USER_SUBSCRIPTIONS: Record<string, UserSubscription> = {
  // Default to free plan for all users
}

export function getUserSubscription(userId: string): UserSubscription {
  return MOCK_USER_SUBSCRIPTIONS[userId] || {
    planId: 'free',
    status: 'active'
  }
}

export function getUserSubscriptionPlan(userId: string): SubscriptionPlan {
  const subscription = getUserSubscription(userId)
  return SUBSCRIPTION_PLANS[subscription.planId] || SUBSCRIPTION_PLANS.free
}

export function canUserAddAdminKey(userId: string, currentAdminKeyCount: number): boolean {
  const plan = getUserSubscriptionPlan(userId)
  
  // If maxAdminKeys is -1, it means unlimited
  if (plan.features.maxAdminKeys === -1) {
    return true
  }
  
  // Otherwise check if current count is less than limit
  return currentAdminKeyCount < plan.features.maxAdminKeys
}

export function getAdminKeyLimitMessage(userId: string, currentAdminKeyCount: number): string | null {
  const plan = getUserSubscriptionPlan(userId)
  
  if (plan.features.maxAdminKeys === -1) {
    return null // No limit
  }
  
  if (currentAdminKeyCount >= plan.features.maxAdminKeys) {
    return `You've reached the limit of ${plan.features.maxAdminKeys} admin API key${plan.features.maxAdminKeys === 1 ? '' : 's'} on the ${plan.name} plan. Upgrade to Pro for unlimited admin keys.`
  }
  
  return null
}

export function isFeatureAvailable(userId: string, feature: keyof SubscriptionPlan['features']): boolean {
  const plan = getUserSubscriptionPlan(userId)
  return plan.features[feature] as boolean
}

// Mock function to upgrade user subscription
export function upgradeUserSubscription(userId: string, planId: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      MOCK_USER_SUBSCRIPTIONS[userId] = {
        planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      resolve(true)
    }, 1000)
  })
}