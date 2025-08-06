'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ClaudeIntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/settings" className="inline-flex items-center gap-2 text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        
        <h1 className="text-3xl font-bold text-white mb-4">Claude Integration</h1>
        <p className="text-gray-400">Testing Claude API integration...</p>
      </div>
    </div>
  )
}