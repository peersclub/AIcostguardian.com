import React from 'react'
import { Building2, Shield, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrganizationLogoProps {
  organizationName: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export function OrganizationLogo({ organizationName, className, size = 'md' }: OrganizationLogoProps) {
  const orgName = organizationName?.toLowerCase() || ''

  // AssetWorks AI specific logo
  if (orgName.includes('assetworks')) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg border border-blue-500/20",
        sizeClasses[size],
        className
      )}>
        <Shield className={cn("text-white", iconSizeClasses[size])} />
      </div>
    )
  }

  // Smatrx specific logo
  if (orgName.includes('smatrx')) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg border border-purple-500/20",
        sizeClasses[size],
        className
      )}>
        <Zap className={cn("text-white", iconSizeClasses[size])} />
      </div>
    )
  }

  // AI Cost Guardian (default)
  if (orgName.includes('ai cost guardian') || orgName.includes('cost') || !orgName) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-lg border border-indigo-500/20",
        sizeClasses[size],
        className
      )}>
        <div className="relative">
          <Building2 className={cn("text-white", iconSizeClasses[size])} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </div>
      </div>
    )
  }

  // Generic organization logo
  return (
    <div className={cn(
      "flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 shadow-lg border border-gray-500/20",
      sizeClasses[size],
      className
    )}>
      <Building2 className={cn("text-white", iconSizeClasses[size])} />
    </div>
  )
}

export function getOrganizationColor(organizationName: string): string {
  const orgName = organizationName?.toLowerCase() || ''

  if (orgName.includes('assetworks')) {
    return 'from-blue-600 to-blue-800'
  }

  if (orgName.includes('smatrx')) {
    return 'from-purple-600 to-purple-800'
  }

  if (orgName.includes('ai cost guardian') || orgName.includes('cost') || !orgName) {
    return 'from-indigo-600 to-indigo-800'
  }

  return 'from-gray-600 to-gray-800'
}

export function getOrganizationWelcomeMessage(organizationName: string): {
  title: string
  subtitle: string
  features: string[]
} {
  const orgName = organizationName?.toLowerCase() || ''

  if (orgName.includes('assetworks')) {
    return {
      title: "Welcome to AIOptimise",
      subtitle: "Your Secure AI Companion for AssetWorks",
      features: [
        "Secure, private conversations with AI",
        "Boost productivity with intelligent assistance",
        "Enterprise-grade security and compliance",
        "Your AI companion whenever you need it"
      ]
    }
  }

  if (orgName.includes('smatrx')) {
    return {
      title: "Welcome to AIOptimise",
      subtitle: "Your Secure AI Companion for Smatrx",
      features: [
        "Secure, private conversations with AI",
        "Boost productivity with intelligent assistance",
        "Enterprise-grade security and compliance",
        "Your AI companion whenever you need it"
      ]
    }
  }

  // AIOptimise (default)
  return {
    title: "Welcome to AIOptimise",
    subtitle: "Your Secure AI Companion",
    features: [
      "Secure, private conversations with AI",
      "Boost productivity with intelligent assistance",
      "Enterprise-grade security and compliance",
      "Your AI companion whenever you need it"
    ]
  }
}