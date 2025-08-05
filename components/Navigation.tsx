'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isProductOpen, setIsProductOpen] = useState(false)
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [productTimeout, setProductTimeout] = useState<NodeJS.Timeout | null>(null)
  const [solutionsTimeout, setSolutionsTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const isLoggedIn = !!session

  // Helper functions for dropdown management
  const handleProductMouseEnter = () => {
    if (productTimeout) {
      clearTimeout(productTimeout)
      setProductTimeout(null)
    }
    setIsProductOpen(true)
  }

  const handleProductMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsProductOpen(false)
    }, 150) // 150ms delay before closing
    setProductTimeout(timeout)
  }

  const handleSolutionsMouseEnter = () => {
    if (solutionsTimeout) {
      clearTimeout(solutionsTimeout)
      setSolutionsTimeout(null)
    }
    setIsSolutionsOpen(true)
  }

  const handleSolutionsMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsSolutionsOpen(false)
    }, 150) // 150ms delay before closing
    setSolutionsTimeout(timeout)
  }

  const guestNavItems = [
    { 
      label: 'Product', 
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { href: '/features', label: 'Features', description: 'Comprehensive AI cost tracking' },
        { href: '/integrations', label: 'Integrations', description: 'Connect with 20+ AI providers' },
        { href: '/security', label: 'Security', description: 'Enterprise-grade protection' }
      ]
    },
    { 
      label: 'Solutions', 
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { href: '/enterprise', label: 'Enterprise', description: 'For large organizations' },
        { href: '/startups', label: 'Startups', description: 'Scale your AI initiatives' },
        { href: '/agencies', label: 'Agencies', description: 'Manage client AI costs' }
      ]
    },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Resources', href: '/resources' },
    { label: 'About Us', href: '/about' }
  ]

  const loggedInNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/usage', label: 'Usage', icon: '📈' },
    { href: '/team', label: 'Team', icon: '👥' },
    { href: '/billing', label: 'Billing', icon: '💳' },
    { href: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  const productDropdownItems = [
    { href: '/dashboard', label: 'Dashboard', description: 'Real-time usage overview', icon: '📊' },
    { href: '/usage', label: 'Analytics', description: 'Advanced usage insights', icon: '📈' },
    { href: '/billing', label: 'Billing', description: 'Manage payments & plans', icon: '💳' },
    { href: '/settings', label: 'Settings', description: 'Configure your account', icon: '⚙️' },
    { href: '/team', label: 'Team', description: 'User management', icon: '👥' },
    { href: '/alerts', label: 'Alerts', description: 'Smart notifications', icon: '🔔' }
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Credit Tracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {!isLoggedIn ? (
              // Guest Navigation
              <>
                {guestNavItems.map((item) => (
                  <div key={item.label} className="relative">
                    {item.hasDropdown ? (
                      <div className="relative">
                        <button
                          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                          onMouseEnter={() => {
                            if (item.label === 'Product') handleProductMouseEnter()
                            if (item.label === 'Solutions') handleSolutionsMouseEnter()
                          }}
                          onMouseLeave={() => {
                            if (item.label === 'Product') handleProductMouseLeave()
                            if (item.label === 'Solutions') handleSolutionsMouseLeave()
                          }}
                        >
                          <span>{item.label}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Dropdown Menu */}
                        {((item.label === 'Product' && isProductOpen) || (item.label === 'Solutions' && isSolutionsOpen)) && (
                          <div 
                            className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                            onMouseEnter={() => {
                              if (item.label === 'Product') handleProductMouseEnter()
                              if (item.label === 'Solutions') handleSolutionsMouseEnter()
                            }}
                            onMouseLeave={() => {
                              if (item.label === 'Product') handleProductMouseLeave()
                              if (item.label === 'Solutions') handleSolutionsMouseLeave()
                            }}
                          >
                            {item.dropdownItems?.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="font-medium text-gray-900">{dropdownItem.label}</div>
                                <div className="text-sm text-gray-500">{dropdownItem.description}</div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </>
            ) : (
              // Logged In Navigation
              <>
                <div className="relative">
                  <button
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    onMouseEnter={handleProductMouseEnter}
                    onMouseLeave={handleProductMouseLeave}
                  >
                    <span>Product</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Product Dropdown for Logged In Users */}
                  {isProductOpen && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      onMouseEnter={handleProductMouseEnter}
                      onMouseLeave={handleProductMouseLeave}
                    >
                      {productDropdownItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                            pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          <span className="text-lg mr-3">{item.icon}</span>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Access Links for Logged In Users */}
                {loggedInNavItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              // Logged In User Actions
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Credits: <span className="font-semibold text-green-600">6,750</span>
                  </div>
                  <Button variant="outline" size="sm">
                    💳 Upgrade
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                  </Button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-medium text-gray-900">{session?.user?.name}</div>
                        <div className="text-sm text-gray-500">{session?.user?.email}</div>
                        {session?.user?.company && (
                          <div className="text-xs text-blue-600 mt-1">{session.user.company}</div>
                        )}
                      </div>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        ⚙️ Settings
                      </Link>
                      <Link href="/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        💳 Billing
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          🚪 Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Guest Actions
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Start free trial
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {!isLoggedIn ? (
                <>
                  {guestNavItems.map((item) => (
                    <div key={item.label}>
                      {item.hasDropdown ? (
                        <div className="space-y-1">
                          <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                            {item.label}
                          </div>
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.href}
                              href={dropdownItem.href}
                              className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {loggedInNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}