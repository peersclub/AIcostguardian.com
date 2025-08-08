# 🚀 AI Cost Guardian - World-Class Frontend Implementation Guide

## 🎯 Executive Summary
This guide provides comprehensive instructions for building a world-class, production-ready frontend for AI Cost Guardian using Next.js 14, React 18, and TypeScript. The architecture is designed for maximum scalability, performance, and developer velocity.

## 📐 Frontend Architecture Principles

### Core Design Principles
1. **Component-Driven Development**: Every UI element is a reusable component
2. **Type Safety First**: 100% TypeScript with strict mode
3. **Performance Obsessed**: Sub-3s page loads, 60fps animations
4. **Accessibility Built-in**: WCAG 2.1 AA compliance
5. **Design System Driven**: Consistent tokens and patterns
6. **State Management**: Predictable, debuggable state
7. **Error Resilient**: Graceful degradation and recovery

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                  # Authentication flow
│   │   ├── signin/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (dashboard)/             # Protected dashboard
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── (marketing)/             # Public pages
│   │   ├── pricing/
│   │   ├── features/
│   │   └── layout.tsx
│   └── api/                     # API routes
│
├── components/                   # Component library
│   ├── ui/                      # Base UI components
│   │   ├── primitives/         # Atomic components
│   │   ├── patterns/           # Common patterns
│   │   └── feedback/           # User feedback
│   ├── features/               # Feature components
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── billing/
│   │   └── providers/
│   ├── layouts/                # Layout components
│   │   ├── DashboardLayout/
│   │   ├── MarketingLayout/
│   │   └── AuthLayout/
│   └── providers/              # Context providers
│
├── lib/                        # Core libraries
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── constants/              # App constants
│   ├── validators/             # Zod schemas
│   └── stores/                 # State management
│
├── styles/                     # Styling
│   ├── globals.css            # Global styles
│   ├── tokens.css             # Design tokens
│   └── themes/                # Theme variations
│
├── types/                      # TypeScript types
│   ├── api/                   # API types
│   ├── components/            # Component types
│   └── global.d.ts            # Global types
│
└── tests/                      # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🎨 Component Architecture

### 1. Component Hierarchy & Composition

```typescript
// components/ui/primitives/Button/Button.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
        gradient: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### 2. Feature Component Pattern

```typescript
// components/features/dashboard/DashboardMetrics/DashboardMetrics.tsx
import { Card } from '@/components/ui/primitives/Card'
import { Skeleton } from '@/components/ui/feedback/Skeleton'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useDashboardMetrics } from '@/lib/hooks/useDashboardMetrics'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  loading?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon,
  loading 
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </Card>
    )
  }

  const trendIcon = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingDown className="w-4 h-4 text-red-500" />,
    neutral: <Minus className="w-4 h-4 text-gray-500" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {trendIcon[trend]}
              <span className={`text-sm ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {formatPercentage(change)}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export const DashboardMetrics: React.FC = () => {
  const { metrics, loading, error } = useDashboardMetrics()

  if (error) {
    return <ErrorState error={error} retry={() => window.location.reload()} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Cost"
        value={formatCurrency(metrics?.totalCost || 0)}
        change={metrics?.costChange}
        trend={metrics?.costTrend}
        loading={loading}
      />
      <MetricCard
        title="API Calls"
        value={metrics?.apiCalls?.toLocaleString() || '0'}
        change={metrics?.callsChange}
        trend={metrics?.callsTrend}
        loading={loading}
      />
      <MetricCard
        title="Active Providers"
        value={metrics?.activeProviders || 0}
        loading={loading}
      />
      <MetricCard
        title="Team Members"
        value={metrics?.teamMembers || 0}
        loading={loading}
      />
    </div>
  )
}
```

### 3. Advanced Chart Component

```typescript
// components/features/analytics/UsageChart/UsageChart.tsx
import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/primitives/Card'
import { Select } from '@/components/ui/primitives/Select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/primitives/Tabs'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'
import { useUsageData } from '@/lib/hooks/useUsageData'
import { DateRangePicker } from '@/components/ui/patterns/DateRangePicker'
import { ChartConfig } from '@/types/charts'

const chartConfig: ChartConfig = {
  openai: { color: '#10B981', label: 'OpenAI' },
  anthropic: { color: '#8B5CF6', label: 'Claude' },
  google: { color: '#3B82F6', label: 'Gemini' },
  xai: { color: '#F59E0B', label: 'Grok' },
  perplexity: { color: '#EC4899', label: 'Perplexity' }
}

export const UsageChart: React.FC = () => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area')
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() })
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['all'])
  
  const { data, loading, error } = useUsageData({ dateRange, providers: selectedProviders })
  
  const chartData = useMemo(() => {
    if (!data) return []
    
    // Transform and aggregate data for chart
    return data.map(item => ({
      date: item.date,
      ...item.providers.reduce((acc, provider) => ({
        ...acc,
        [provider.name]: provider.cost
      }), {})
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">{chartConfig[entry.dataKey]?.label}</span>
            </span>
            <span className="font-mono text-sm font-medium">
              ${entry.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Usage Analytics</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full sm:w-auto"
            />
            <Select
              value={selectedProviders}
              onValueChange={setSelectedProviders}
              multiple
              placeholder="All Providers"
            >
              {Object.entries(chartConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  {config.label}
                </Select.Option>
              ))}
            </Select>
            <Tabs value={chartType} onValueChange={setChartType}>
              <TabsList>
                <TabsTrigger value="area">Area</TabsTrigger>
                <TabsTrigger value="line">Line</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                {Object.entries(chartConfig).map(([key, config]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.entries(chartConfig).map(([key, config]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.color}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.entries(chartConfig).map(([key, config]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

## 🎯 State Management Architecture

### 1. Zustand Store Pattern

```typescript
// lib/stores/useGlobalStore.ts
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface GlobalState {
  // User State
  user: User | null
  organization: Organization | null
  
  // UI State
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Data State
  providers: Provider[]
  apiKeys: ApiKey[]
  
  // Actions
  setUser: (user: User) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addApiKey: (key: ApiKey) => void
  removeApiKey: (id: string) => void
}

export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          // Initial State
          user: null,
          organization: null,
          sidebarOpen: true,
          theme: 'system',
          providers: [],
          apiKeys: [],
          
          // Actions with Immer
          setUser: (user) => set((state) => {
            state.user = user
          }),
          
          toggleSidebar: () => set((state) => {
            state.sidebarOpen = !state.sidebarOpen
          }),
          
          setTheme: (theme) => set((state) => {
            state.theme = theme
          }),
          
          addApiKey: (key) => set((state) => {
            state.apiKeys.push(key)
          }),
          
          removeApiKey: (id) => set((state) => {
            state.apiKeys = state.apiKeys.filter(k => k.id !== id)
          })
        }))
      ),
      {
        name: 'ai-cost-guardian-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen
        })
      }
    ),
    {
      name: 'AIGlobalStore'
    }
  )
)

// Selectors
export const selectUser = (state: GlobalState) => state.user
export const selectTheme = (state: GlobalState) => state.theme
export const selectApiKeys = (state: GlobalState) => state.apiKeys
```

### 2. React Query Configuration

```typescript
// lib/query/queryClient.ts
import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false
        if (error?.status === 401) return false
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always'
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        toast.error(error?.message || 'Something went wrong')
      }
    }
  },
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      if (query.state.data !== undefined) {
        toast.error(`Error: ${error.message}`)
      }
    }
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`)
    }
  })
})
```

## 🚀 Custom Hooks Library

### 1. Data Fetching Hook

```typescript
// lib/hooks/useApiData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { api } from '@/lib/api'

interface UseApiDataOptions {
  key: string | string[]
  fetcher: () => Promise<any>
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useApiData<T = any>({
  key,
  fetcher,
  enabled = true,
  staleTime,
  refetchInterval,
  onSuccess,
  onError
}: UseApiDataOptions) {
  const queryKey = Array.isArray(key) ? key : [key]
  
  const query = useQuery({
    queryKey,
    queryFn: fetcher,
    enabled,
    staleTime,
    refetchInterval,
    onSuccess,
    onError
  })
  
  const refresh = useCallback(() => {
    query.refetch()
  }, [query])
  
  return {
    data: query.data as T,
    loading: query.isLoading,
    error: query.error,
    refresh,
    isRefetching: query.isRefetching,
    isSuccess: query.isSuccess
  }
}
```

### 2. Form Management Hook

```typescript
// lib/hooks/useForm.ts
import { useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

interface UseFormOptions<T extends z.ZodType> {
  schema: T
  defaultValues?: z.infer<T>
  onSubmit: (data: z.infer<T>) => Promise<any>
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useForm<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  onError
}: UseFormOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  })
  
  const mutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: (data) => {
      form.reset()
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(error)
    },
    onSettled: () => {
      setIsSubmitting(false)
    }
  })
  
  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true)
    await mutation.mutateAsync(data)
  })
  
  return {
    ...form,
    handleSubmit,
    isSubmitting,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty
  }
}
```

### 3. Debounced Search Hook

```typescript
// lib/hooks/useDebounce.ts
import { useState, useEffect, useCallback } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const [timer, setTimer] = useState<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer)
      
      const newTimer = setTimeout(() => {
        callback(...args)
      }, delay)
      
      setTimer(newTimer)
    },
    [callback, delay, timer]
  ) as T

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timer])

  return debouncedCallback
}
```

## 🎨 Design System & Theming

### 1. Design Tokens

```css
/* styles/tokens.css */
:root {
  /* Colors */
  --color-primary: 99 102 241;
  --color-secondary: 139 92 246;
  --color-success: 16 185 129;
  --color-warning: 245 158 11;
  --color-error: 239 68 68;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Animation */
  --animation-fast: 150ms;
  --animation-base: 250ms;
  --animation-slow: 350ms;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
}

[data-theme="dark"] {
  --color-background: 9 9 11;
  --color-foreground: 250 250 250;
  --color-card: 24 24 27;
  --color-border: 39 39 42;
}

[data-theme="light"] {
  --color-background: 255 255 255;
  --color-foreground: 9 9 11;
  --color-card: 255 255 255;
  --color-border: 228 228 231;
}
```

### 2. Theme Provider

```typescript
// components/providers/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    } else {
      root.classList.add(theme)
      setResolvedTheme(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

## ⚡ Performance Optimization

### 1. Code Splitting & Lazy Loading

```typescript
// app/(dashboard)/layout.tsx
import { Suspense, lazy } from 'react'
import { DashboardSkeleton } from '@/components/ui/feedback/DashboardSkeleton'

// Lazy load heavy components
const DashboardMetrics = lazy(() => 
  import('@/components/features/dashboard/DashboardMetrics')
    .then(module => ({ default: module.DashboardMetrics }))
)

const UsageChart = lazy(() => 
  import('@/components/features/analytics/UsageChart')
    .then(module => ({ default: module.UsageChart }))
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Suspense fallback={<DashboardSkeleton />}>
        <aside className="w-64 border-r">
          {/* Sidebar content */}
        </aside>
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<DashboardSkeleton />}>
            {children}
          </Suspense>
        </main>
      </Suspense>
    </div>
  )
}
```

### 2. Image Optimization

```typescript
// components/ui/patterns/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  onLoadingComplete?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  onLoadingComplete
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted',
        className
      )}>
        <span className="text-muted-foreground">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
        )}
        onLoadingComplete={() => {
          setIsLoading(false)
          onLoadingComplete?.()
        }}
        onError={() => setError(true)}
      />
    </div>
  )
}
```

### 3. Virtual Scrolling for Large Lists

```typescript
// components/ui/patterns/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  className?: string
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 50,
  className
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5
  })

  return (
    <div ref={parentRef} className={cn('overflow-auto', className)}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🔧 Utility Functions

### 1. API Client with Interceptors

```typescript
// lib/api/client.ts
import axios, { AxiosError, AxiosInstance } from 'axios'
import { getSession } from 'next-auth/react'
import { toast } from 'sonner'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const session = await getSession()
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = crypto.randomUUID()

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const { response } = error

        if (response?.status === 401) {
          // Token expired, redirect to login
          window.location.href = '/auth/signin'
        }

        if (response?.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.')
        }

        if (response?.status >= 500) {
          toast.error('Server error. Please try again later.')
        }

        return Promise.reject(error)
      }
    )
  }

  // HTTP methods with proper typing
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url)
    return response.data
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data)
    return response.data
  }
}

export const apiClient = new ApiClient()
```

### 2. Form Validation Schemas

```typescript
// lib/validators/schemas.ts
import { z } from 'zod'

export const apiKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'xai', 'perplexity']),
  key: z.string().min(20, 'API key must be at least 20 characters'),
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  isAdmin: z.boolean().optional()
})

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  role: z.enum(['user', 'admin', 'super_admin']),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean()
  })
})

export const alertRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['cost', 'usage', 'rate_limit', 'error']),
  threshold: z.number().positive('Threshold must be positive'),
  provider: z.enum(['all', 'openai', 'anthropic', 'google', 'xai', 'perplexity']),
  period: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  enabled: z.boolean(),
  channels: z.array(z.enum(['email', 'slack', 'webhook']))
})
```

## 🎯 Error Handling & Loading States

### 1. Global Error Boundary

```typescript
// components/providers/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send to Sentry or other monitoring service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-muted rounded-lg text-left">
                <summary className="cursor-pointer font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 2. Loading Skeletons

```typescript
// components/ui/feedback/Skeleton.tsx
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }

  return (
    <div
      className={cn(
        'bg-muted',
        variants[variant],
        animations[animation],
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%')
      }}
      {...props}
    />
  )
}

// Complex skeleton for dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-2">
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton variant="text" width="80%" height={32} />
            <Skeleton variant="text" width="40%" height={12} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="border rounded-lg p-6">
        <Skeleton variant="text" width="200px" height={24} className="mb-4" />
        <Skeleton variant="rectangular" height={400} />
      </div>

      {/* Table */}
      <div className="border rounded-lg p-6">
        <Skeleton variant="text" width="150px" height={24} className="mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

## 📱 Responsive Design System

### 1. Responsive Hooks

```typescript
// lib/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Preset breakpoints
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const isLargeScreen = useMediaQuery('(min-width: 1440px)')

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  }
}
```

## 🔐 Authentication Flow

### 1. Protected Route Wrapper

```typescript
// components/auth/ProtectedRoute.tsx
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin' | 'super_admin'
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  fallback 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/unauthorized')
    }
  }, [session, status, router, requiredRole])

  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
```

## 🧪 Testing Setup

### 1. Component Testing

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/primitives/Button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    
    rerender(<Button variant="outline">Cancel</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
  })
})
```

## 📦 Build Configuration

### 1. Next.js Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: ['localhost', 'api.aicostguardian.com'],
    formats: ['image/avif', 'image/webp']
  },
  
  experimental: {
    optimizeCss: true,
    turbo: {
      resolveAlias: {
        '@': './src'
      }
    }
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
            },
            name(module) {
              const hash = crypto.createHash('sha1')
              hash.update(module.identifier())
              return hash.digest('hex').substring(0, 8)
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20
          },
          shared: {
            name(module, chunks) {
              return crypto
                .createHash('sha1')
                .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                .digest('hex')
                .substring(0, 8)
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true
          }
        }
      }
    }
    return config
  }
}

module.exports = nextConfig
```

## 🚀 Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Prettier formatting applied
- [ ] No console.log statements in production
- [ ] All TODO comments resolved

### Performance
- [ ] Lighthouse score > 90
- [ ] Bundle size < 500KB initial
- [ ] Images optimized with next/image
- [ ] Fonts preloaded
- [ ] Critical CSS inlined

### Testing
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests for critical paths
- [ ] Cross-browser testing complete
- [ ] Mobile responsiveness verified

### Security
- [ ] Environment variables secured
- [ ] API keys encrypted
- [ ] CORS configured properly
- [ ] CSP headers set
- [ ] Rate limiting implemented

### SEO & Analytics
- [ ] Meta tags configured
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Analytics tracking setup
- [ ] Error tracking enabled

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Component storybook updated
- [ ] Deployment guide written
- [ ] Environment variables documented
```

## 📝 Development Guidelines

1. **Always use TypeScript** - No `any` types except when absolutely necessary
2. **Component first** - Build UI as composable components
3. **Mobile first** - Design for mobile, enhance for desktop
4. **Accessibility always** - ARIA labels, keyboard navigation, screen reader support
5. **Performance matters** - Lazy load, code split, optimize images
6. **Test everything** - Unit, integration, and E2E tests
7. **Document as you go** - JSDoc comments, README updates
8. **Use the design system** - Consistent tokens and components
9. **Handle all states** - Loading, error, empty, success
10. **Optimize for SEO** - Proper meta tags, structured data

This comprehensive guide ensures your frontend is world-class, scalable, and production-ready. Follow these patterns and the application will be maintainable, performant, and delightful to use.