'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []

    // Start loading when pathname changes
    setLoading(true)
    setProgress(0)

    // Animate progress with realistic acceleration
    const progressSteps = [
      { progress: 20, delay: 50 },
      { progress: 35, delay: 150 },
      { progress: 50, delay: 250 },
      { progress: 65, delay: 350 },
      { progress: 80, delay: 450 },
      { progress: 90, delay: 550 },
      { progress: 95, delay: 650 },
      { progress: 100, delay: 750 }
    ]

    progressSteps.forEach(({ progress, delay }) => {
      const timeout = setTimeout(() => setProgress(progress), delay)
      timeoutsRef.current.push(timeout)
    })
    
    // Complete and hide
    const hideTimeout = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 850)
    timeoutsRef.current.push(hideTimeout)

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
    }
  }, [pathname])

  // Handle click events on all links for immediate feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.href.startsWith('#') && !link.target) {
        const currentUrl = window.location.href
        const targetUrl = link.href
        
        // Only show loader for actual navigation (different page)
        if (currentUrl !== targetUrl && !targetUrl.includes('#')) {
          setLoading(true)
          setProgress(5)
        }
      }
    }

    // Handle browser back/forward
    const handlePopstate = () => {
      setLoading(true)
      setProgress(5)
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopstate)
    
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [])

  if (!loading) return null

  return (
    <>
      {/* Top progress bar at the very top of viewport */}
      <div className="fixed top-0 left-0 right-0 z-[10000] h-[3px] pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all ease-out relative"
          style={{ 
            width: `${progress}%`,
            transitionDuration: progress === 0 ? '0ms' : '200ms',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(147, 51, 234, 0.5)'
          }}
        >
          {/* Glowing tip */}
          <div className="absolute right-0 top-0 w-2 h-full bg-white rounded-full animate-pulse" 
               style={{ 
                 boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.8)' 
               }} 
          />
        </div>
      </div>
      
      {/* Bottom shadow for better visibility */}
      <div 
        className="fixed top-[3px] left-0 right-0 z-[9999] h-[1px] pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, rgba(59, 130, 246, 0.3) ${progress}%, transparent ${progress}%)`,
          filter: 'blur(2px)'
        }}
      />
    </>
  )
}