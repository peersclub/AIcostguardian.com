'use client'

import { motion } from 'framer-motion'

interface DemoLabelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function DemoLabel({ position = 'top-right' }: DemoLabelProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed ${positionClasses[position]} z-50`}
    >
      <div className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        Demo Data
      </div>
    </motion.div>
  )
}