'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface DashboardLayoutProps {
  title: string
  subtitle?: string
  backLink?: string
  backLabel?: string
  actions?: React.ReactNode
  children: React.ReactNode
  gradient?: 'default' | 'dark' | 'blue' | 'purple' | 'green'
}

const gradients = {
  default: 'from-gray-900 via-black to-gray-900',
  dark: 'from-black via-gray-900 to-black',
  blue: 'from-blue-900/20 via-black to-indigo-900/20',
  purple: 'from-purple-900/20 via-black to-pink-900/20',
  green: 'from-emerald-900/20 via-black to-teal-900/20'
}

export default function DashboardLayout({
  title,
  subtitle,
  backLink,
  backLabel = 'Back',
  actions,
  children,
  gradient = 'default'
}: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradients[gradient]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {backLink && (
          <Link href={backLink} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
          </div>
          
          {actions && (
            <div className="flex items-center gap-4">
              {actions}
            </div>
          )}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}