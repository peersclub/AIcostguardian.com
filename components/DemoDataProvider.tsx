'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle } from 'lucide-react'

export default function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    const handleToggle = () => setShowSummary(prev => !prev)
    window.addEventListener('toggleDemoSummary', handleToggle)
    return () => window.removeEventListener('toggleDemoSummary', handleToggle)
  }, [])

  const demoDataSummary = [
    {
      category: 'AI Provider Pricing',
      items: [
        'OpenAI GPT-4: $30/1M tokens',
        'Claude 3 Opus: $15/1M tokens',
        'Gemini Pro: $7/1M tokens',
        'Average cost: $30-50/user/month'
      ]
    },
    {
      category: 'Usage Metrics',
      items: [
        'Daily API calls: 10,000-50,000',
        'Token usage: 5M-20M tokens/day',
        'Peak hours: 9 AM - 5 PM EST',
        'Average response time: 1.2s'
      ]
    },
    {
      category: 'Cost Calculations',
      items: [
        'Company multipliers: 0.8x - 1.2x',
        'Volume discounts: 10-30% off',
        'Enterprise savings: 40-60%',
        'ROI period: 3-6 months'
      ]
    },
    {
      category: 'Demo Limitations',
      items: [
        'Historical data is simulated',
        'Real integrations require API keys',
        'Export features are disabled',
        'Team features show sample data'
      ]
    }
  ]

  return (
    <>
      {children}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Demo Mode Active</h2>
                      <p className="text-white/90 mt-1">This application is running with sample data</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {demoDataSummary.map((section, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {section.category}
                      </h3>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Footer Note */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> To use real data, sign up for an account and connect your AI provider API keys. 
                    All features are fully functional with live data once authenticated.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}