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
  Bell,
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
  Sparkles
} from 'lucide-react'

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
        { label: 'Cost Calculator', href: '/ai-cost-calculator', icon: Calculator, visibility: 'all', badge: 'New' },
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
        { label: 'For Startups', href: '/solutions/startups', icon: Zap, visibility: 'all' },
        { label: 'For Enterprise', href: '/solutions/enterprise', icon: Building2, visibility: 'all' },
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

  const authenticatedNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
      visibility: 'auth'
    },
    {
      label: 'AIOptimise',
      href: '/aioptimise',
      icon: Sparkles,
      badge: 'New',
      visibility: 'auth'
    },
    {
      label: 'Analytics',
      href: '#',
      icon: BarChart3,
      visibility: 'auth',
      children: [
        { label: 'Usage Reports', href: '/analytics/usage', icon: FileText, visibility: 'auth' },
        { label: 'Cost Trends', href: '/analytics/trends', icon: TrendingUp, visibility: 'auth' },
        { label: 'Provider Insights', href: '/analytics/providers', icon: Globe, visibility: 'auth' }
      ]
    },
    {
      label: 'Team',
      href: '#',
      icon: Users,
      visibility: 'auth',
      children: [
        { label: 'Members', href: '/team/members', icon: Users, visibility: 'auth' },
        { label: 'Permissions', href: '/team/permissions', icon: Shield, visibility: 'auth' },
        { label: 'Usage Limits', href: '/team/limits', icon: CreditCard, visibility: 'auth' }
      ]
    },
    {
      label: 'Cost Calculator',
      href: '/ai-cost-calculator',
      icon: Calculator,
      visibility: 'auth',
      badge: 'New'
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      visibility: 'auth'
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Logo size="sm" showText={false} className="h-8" />
              <span className="ml-2 font-bold text-xl hidden sm:block">AICostGuardian</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Home link for all users */}
              {pathname !== '/' && (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              )}
              
              {navigationItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.children ? (
                    <button
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive(item.href)
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive(item.href)
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded">
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
                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className="ml-auto px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded">
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
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            )}

            {/* Demo Data Button - available for all */}
            <button 
              onClick={() => {
                const event = new CustomEvent('toggleDemoSummary')
                window.dispatchEvent(event)
              }}
              className="relative p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/billing"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Billing</span>
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
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
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-1">
              {pathname !== '/' && (
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
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
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <div className="ml-7 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                          >
                            <child.icon className="w-3 h-3" />
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className="ml-auto px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded">
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
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-sm font-medium text-center text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"
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