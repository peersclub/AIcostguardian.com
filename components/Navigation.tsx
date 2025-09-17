'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'
import { Logo } from '@/components/ui/Logo'
import {
  LayoutDashboard,
  Calculator,
  Users,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Globe,
  User,
  Home,
  TrendingUp,
  Brain,
  Target,
  Building2,
  Layers,
  DollarSign,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Key,
  Activity,
  Bell
} from 'lucide-react'
import { EnhancedNotificationBell } from '@/components/notifications/EnhancedNotificationBell'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  children?: NavItem[]
  visibility: 'all' | 'auth' | 'visitor' // Who can see this item
}

export default function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(3)

  // Different navigation items for visitors vs authenticated users
  const visitorNavItems: NavItem[] = [
    {
      label: 'Products',
      href: '#',
      icon: Layers,
      visibility: 'visitor',
      children: [
        { label: 'AiOptimize (New)', href: '/aioptimize', icon: Sparkles, badge: 'Latest', visibility: 'all' },
        { label: 'AiOptimise (Original)', href: '/aioptimise', icon: Brain, badge: 'V1', visibility: 'all' },
        { label: 'AiOptimiseV2 (Enhanced)', href: '/aioptimiseV2', icon: Target, badge: 'V2', visibility: 'all' },
        { label: 'Cost Calculator', href: '/ai-cost-calculator', icon: Calculator, visibility: 'all' },
        { label: 'AI Models', href: '/models', icon: Brain, visibility: 'all' },
        { label: 'Integrations', href: '/integrations', icon: Globe, visibility: 'all' }
      ]
    },
    {
      label: 'Solutions',
      href: '#',
      icon: Target,
      visibility: 'visitor',
      children: [
        { label: 'For Startups', href: '/startups', icon: Zap, visibility: 'all' },
        { label: 'For Enterprise', href: '/enterprise', icon: Building2, visibility: 'all' },
        { label: 'For Agencies', href: '/agencies', icon: Users, visibility: 'all' },
        { label: 'For Developers', href: '/solutions/developers', icon: FileText, visibility: 'all' }
      ]
    },
    {
      label: 'Pricing',
      href: '/pricing',
      icon: DollarSign,
      visibility: 'visitor'
    },
    {
      label: 'Docs',
      href: '/docs',
      icon: BookOpen,
      visibility: 'visitor'
    }
  ]

  // Check if user is admin (you can customize this logic based on your auth setup)
  const isAdmin = session?.user?.email?.includes('@aicostguardian') || (session?.user as any)?.role === 'admin'

  const authenticatedNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
      visibility: 'auth',
      children: [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, visibility: 'auth' },
        { label: 'Usage & Analytics', href: '/usage', icon: BarChart3, visibility: 'auth' },
        { label: 'Cost Calculator', href: '/ai-cost-calculator', icon: Calculator, visibility: 'auth' },
        { label: 'Monitoring', href: '/monitoring/dashboard', icon: Activity, visibility: 'auth' },
        { label: 'Alerts', href: '/alerts', icon: AlertTriangle, visibility: 'auth' }
      ]
    },
    {
      label: 'AiOptimize',
      href: '/aioptimize',
      icon: Sparkles,
      badge: 'Pro',
      visibility: 'auth',
      children: [
        { label: 'AiOptimize (New)', href: '/aioptimize', icon: Sparkles, badge: 'Latest', visibility: 'auth' },
        { label: 'AiOptimise (Original)', href: '/aioptimise', icon: Brain, badge: 'V1', visibility: 'auth' },
        { label: 'AiOptimiseV2 (Enhanced)', href: '/aioptimiseV2', icon: Target, badge: 'V2', visibility: 'auth' }
      ]
    },
    // Add Organization link for admins
    ...(isAdmin ? [{
      label: 'Organization',
      href: '/organization',
      icon: Building2,
      visibility: 'auth' as const,
      children: [
        { label: 'Overview', href: '/organization', icon: Building2, visibility: 'auth' as const },
        { label: 'Team Members', href: '/organization/members', icon: Users, visibility: 'auth' as const },
        { label: 'Permissions', href: '/organization/permissions', icon: Shield, visibility: 'auth' as const },
        { label: 'Usage Limits', href: '/organization/usage-limits', icon: Activity, visibility: 'auth' as const }
      ]
    }] : []),
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      visibility: 'auth',
      children: [
        { label: 'General Settings', href: '/settings', icon: Settings, visibility: 'auth' },
        { label: 'API Keys', href: '/settings/api-keys', icon: Key, badge: 'New', visibility: 'auth' },
        { label: 'Notifications', href: '/notifications/settings', icon: Bell, visibility: 'auth' },
        { label: 'Team Members', href: '/organization/members', icon: Users, visibility: 'auth' },
        { label: 'Permissions', href: '/organization/permissions', icon: Shield, visibility: 'auth' },
        { label: 'Usage Limits', href: '/organization/usage-limits', icon: CreditCard, visibility: 'auth' },
        { label: 'Billing', href: '/billing', icon: CreditCard, visibility: 'auth' }
      ]
    }
  ]

  // Select navigation items based on auth status
  const navigationItems = status === 'authenticated' ? authenticatedNavItems : visitorNavItems

  useEffect(() => {
    setMobileMenuOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '#') return false
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Don't show navigation on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Logo size="sm" showText={false} className="h-8" />
              <span className="ml-2 font-bold text-xl hidden sm:block bg-gradient-to-r from-violet-400 to-purple-400 text-transparent bg-clip-text">
                AICostGuardian
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Home link for all users */}
              {pathname !== '/' && (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              )}
              
              {navigationItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.children ? (
                    <div
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                          ${item.children.some(child => isActive(child.href)) || isActive(item.href)
                            ? 'bg-violet-900/50 text-violet-300 border border-violet-500/30'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                          }
                        `}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`ml-1 px-1.5 py-0.5 text-xs font-semibold rounded ${
                            item.badge === 'Live' 
                              ? 'bg-green-500/20 text-green-400' 
                              : item.badge === 'Pro'
                              ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-500/30'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown className={`w-3 h-3 transition-transform ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive(item.href)
                          ? 'bg-violet-900/50 text-violet-300 border border-violet-500/30'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`ml-1 px-1.5 py-0.5 text-xs font-semibold rounded ${
                          item.badge === 'Live' 
                            ? 'bg-green-500/20 text-green-400' 
                            : item.badge === 'Pro'
                            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full left-0 mt-1 w-56 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-800 py-1"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all"
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className={`ml-auto px-1.5 py-0.5 text-xs font-semibold rounded ${
                                child.badge === 'Live' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : child.badge === 'Try Now'
                                  ? 'bg-violet-500/20 text-violet-300'
                                  : child.badge === 'Coming Soon'
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications - only for authenticated users */}
            {status === 'authenticated' && (
              <EnhancedNotificationBell className="text-gray-400 hover:text-white" />
            )}

            {/* Demo Data Button - available for all */}
            <button 
              onClick={() => {
                const event = new CustomEvent('toggleDemoSummary')
                window.dispatchEvent(event)
              }}
              className="relative p-2 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
              title="Demo Data Info"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* User Menu or Auth Buttons */}
            {status === 'authenticated' && session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                  className="flex items-center gap-2 p-2 text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-1 w-56 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-800 py-1"
                    >
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-sm font-medium text-white">
                          {session.user.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/settings/api-keys"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      >
                        <Key className="w-4 h-4" />
                        <span>API Keys</span>
                      </Link>
                      <Link
                        href="/billing"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Billing</span>
                      </Link>
                      <div className="border-t border-gray-800 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-1">
              {pathname !== '/' && (
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              )}
              
              {navigationItems.map((item) => (
                <div key={item.label}>
                  {!item.children ? (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive(item.href)
                          ? 'bg-violet-900/50 text-violet-300 border border-violet-500/30'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`ml-auto px-1.5 py-0.5 text-xs font-semibold rounded ${
                          item.badge === 'Live' 
                            ? 'bg-green-500/20 text-green-400' 
                            : item.badge === 'Pro'
                            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <div className="ml-7 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white"
                          >
                            <child.icon className="w-3 h-3" />
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className={`ml-auto px-1.5 py-0.5 text-xs font-semibold rounded ${
                                child.badge === 'Live' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : child.badge === 'Try Now'
                                  ? 'bg-violet-500/20 text-violet-300'
                                  : child.badge === 'Coming Soon'
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {status === 'authenticated' ? (
                <div className="border-t border-gray-800 pt-3 mt-3">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-800 pt-3 mt-3 space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-sm font-medium text-center text-gray-300 hover:text-white border border-gray-700 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}