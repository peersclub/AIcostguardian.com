export const APP_NAME = 'AICostGuardian'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Enterprise AI Usage Tracking & Cost Management Dashboard'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const POLLING_INTERVALS = {
  STATUS_CHECK: 30000, // 30 seconds
  USAGE_REFRESH: 60000, // 1 minute
  DASHBOARD_REFRESH: 120000, // 2 minutes
  ALERT_CHECK: 300000, // 5 minutes
} as const

export const LIMITS = {
  FREE_PLAN: {
    ADMIN_KEYS: 1,
    TEAM_MEMBERS: 3,
    API_REQUESTS: 10000,
    DATA_RETENTION: 30, // days
    EXPORT_ENABLED: false,
  },
  PRO_PLAN: {
    ADMIN_KEYS: 5,
    TEAM_MEMBERS: 25,
    API_REQUESTS: 100000,
    DATA_RETENTION: 90, // days
    EXPORT_ENABLED: true,
  },
  ENTERPRISE_PLAN: {
    ADMIN_KEYS: -1, // unlimited
    TEAM_MEMBERS: -1, // unlimited
    API_REQUESTS: -1, // unlimited
    DATA_RETENTION: 365, // days
    EXPORT_ENABLED: true,
  },
} as const

export const COST_THRESHOLDS = {
  WARNING: 100,
  DANGER: 500,
  CRITICAL: 1000,
} as const

export const USAGE_SCENARIOS = {
  LIGHT: {
    id: 'light',
    name: 'Occasional',
    description: 'Few times a week',
    multiplier: 0.3,
  },
  MODERATE: {
    id: 'moderate',
    name: 'Regular',
    description: 'Daily usage',
    multiplier: 1,
  },
  HEAVY: {
    id: 'heavy',
    name: 'Intensive',
    description: 'Core operations',
    multiplier: 2.5,
  },
} as const

export const COMPANY_TYPES = {
  STARTUP: {
    id: 'startup',
    name: 'Startup',
    description: 'Moving fast',
    icon: '🚀',
    multiplier: 1.2,
  },
  SCALEUP: {
    id: 'scaleup',
    name: 'Scale-up',
    description: 'Growing rapidly',
    icon: '📈',
    multiplier: 1,
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Established leader',
    icon: '🏢',
    multiplier: 0.8,
  },
} as const

export const TEAM_SIZE_RANGES = {
  MICRO: {
    id: '1-5',
    name: '1-5 people',
    min: 1,
    max: 5,
    avg: 3,
  },
  SMALL: {
    id: '6-15',
    name: '6-15 people',
    min: 6,
    max: 15,
    avg: 10,
  },
  MEDIUM: {
    id: '16-50',
    name: '16-50 people',
    min: 16,
    max: 50,
    avg: 30,
  },
  LARGE: {
    id: '51-150',
    name: '51-150 people',
    min: 51,
    max: 150,
    avg: 100,
  },
  XLARGE: {
    id: '150+',
    name: '150+ people',
    min: 150,
    max: 500,
    avg: 300,
  },
} as const

export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
  secondary: '#6B7280',
  providers: {
    openai: '#10A37F',
    claude: '#D97706',
    gemini: '#4285F4',
    grok: '#000000',
    perplexity: '#20B2AA',
  },
} as const

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ai-guardian-auth',
  USER_PREFERENCES: 'ai-guardian-prefs',
  THEME: 'ai-guardian-theme',
  SELECTED_PROVIDER: 'ai-guardian-provider',
  DASHBOARD_LAYOUT: 'ai-guardian-layout',
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  API_KEY_INVALID: 'Invalid API key. Please check and try again.',
  API_KEY_EXISTS: 'This API key is already registered.',
  LIMIT_EXCEEDED: 'You have exceeded your plan limits.',
} as const

export const SUCCESS_MESSAGES = {
  API_KEY_ADDED: 'API key added successfully',
  API_KEY_REMOVED: 'API key removed successfully',
  API_KEY_TESTED: 'API key tested successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  REPORT_GENERATED: 'Report generated successfully',
  INVITE_SENT: 'Invitation sent successfully',
} as const

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  USAGE: '/usage',
  TEAM: '/team',
  BILLING: '/billing',
  ALERTS: '/alerts',
  INTEGRATIONS: '/integrations',
  UPGRADE: '/upgrade',
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    ERROR: '/auth/error',
  },
  API: {
    PROVIDERS: '/api/providers',
    USAGE: '/api/usage',
    SETTINGS: '/api/settings',
    TEAM: '/api/team',
    ALERTS: '/api/alerts',
    SUBSCRIPTION: '/api/subscription',
  },
} as const

export const META_TAGS = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: 'AI, cost management, usage tracking, OpenAI, Claude, Gemini, enterprise, dashboard',
  author: 'PeersClub',
  og: {
    type: 'website',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    image: '/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    image: '/twitter-image.png',
  },
} as const