import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
  variant?: 'default' | 'white' | 'dark'
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '',
  textClassName = '',
  variant = 'default'
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl' }
  }

  const { icon, text } = sizeMap[size]
  
  // Dynamic color schemes based on variant
  const getColors = () => {
    if (variant === 'white') {
      return {
        gradient1: ['#ffffff', '#f0f0f0', '#e0e0e0'],
        gradient2: ['#d0d0d0', '#ffffff'],
        center: '#0078D4'
      }
    } else if (variant === 'dark') {
      return {
        gradient1: ['#003966', '#0078D4', '#00BCF2'],
        gradient2: ['#002040', '#003966'],
        center: '#ffffff'
      }
    }
    // Default colors
    return {
      gradient1: ['#0078D4', '#00BCF2', '#00D4AA'],
      gradient2: ['#005A9E', '#0078D4'],
      center: '#ffffff'
    }
  }
  
  const colors = getColors()
  const gradientId = `logo-gradient-${variant}`
  const gradient2Id = `logo-gradient2-${variant}`

  return (
    <div className={`flex items-center ${className}`}>
      {/* Swirl Logo */}
      <div className={`${icon} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 256 256"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.gradient1[0]} />
              <stop offset="50%" stopColor={colors.gradient1[1]} />
              <stop offset="100%" stopColor={colors.gradient1[2]} />
            </linearGradient>
            <linearGradient id={gradient2Id} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={colors.gradient2[0]} />
              <stop offset="100%" stopColor={colors.gradient2[1]} />
            </linearGradient>
            <filter id={`shadow-${variant}`}>
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.15"/>
            </filter>
          </defs>
          
          <g transform="translate(128, 128)" filter={`url(#shadow-${variant})`}>
            {/* Outer swirl */}
            <path 
              d="M 0 -80 A 80 80 0 1 1 0 80 A 40 40 0 1 0 0 0 A 20 20 0 1 1 0 -40 A 60 60 0 1 0 0 -80 Z"
              fill={`url(#${gradientId})`}
            />
            
            {/* Inner swirl */}
            <path 
              d="M 0 -50 A 50 50 0 1 1 0 50 A 25 25 0 1 0 0 0 A 12.5 12.5 0 1 1 0 -25 A 37.5 37.5 0 1 0 0 -50 Z"
              fill={`url(#${gradient2Id})`}
              opacity="0.9"
            />
            
            {/* Center circle */}
            <circle cx="0" cy="0" r="8" fill={colors.center} />
          </g>
        </svg>
        
        {/* Glow effect for dark backgrounds */}
        {variant === 'dark' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 to-teal-400/10 blur-xl"></div>
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className={`ml-3 flex flex-col ${textClassName}`}>
          <span className={`font-bold ${text} bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent tracking-tight`}>
            AICostGuardian
          </span>
          <span className="text-xs text-muted-foreground -mt-1">Enterprise Edition</span>
        </div>
      )}
    </div>
  )
}

export const LogoSymbol: React.FC<{ className?: string; variant?: 'default' | 'white' | 'dark' }> = ({ 
  className = '',
  variant = 'default'
}) => {
  const getColors = () => {
    if (variant === 'white') {
      return {
        gradient1: ['#ffffff', '#f0f0f0', '#e0e0e0'],
        gradient2: ['#d0d0d0', '#ffffff'],
        center: '#0078D4'
      }
    } else if (variant === 'dark') {
      return {
        gradient1: ['#003966', '#0078D4', '#00BCF2'],
        gradient2: ['#002040', '#003966'],
        center: '#ffffff'
      }
    }
    return {
      gradient1: ['#0078D4', '#00BCF2', '#00D4AA'],
      gradient2: ['#005A9E', '#0078D4'],
      center: '#ffffff'
    }
  }
  
  const colors = getColors()
  const gradientId = `symbol-gradient-${variant}`
  const gradient2Id = `symbol-gradient2-${variant}`
  
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.gradient1[0]} />
          <stop offset="50%" stopColor={colors.gradient1[1]} />
          <stop offset="100%" stopColor={colors.gradient1[2]} />
        </linearGradient>
        <linearGradient id={gradient2Id} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={colors.gradient2[0]} />
          <stop offset="100%" stopColor={colors.gradient2[1]} />
        </linearGradient>
      </defs>
      
      <g transform="translate(128, 128)">
        <path 
          d="M 0 -80 A 80 80 0 1 1 0 80 A 40 40 0 1 0 0 0 A 20 20 0 1 1 0 -40 A 60 60 0 1 0 0 -80 Z"
          fill={`url(#${gradientId})`}
        />
        <path 
          d="M 0 -50 A 50 50 0 1 1 0 50 A 25 25 0 1 0 0 0 A 12.5 12.5 0 1 1 0 -25 A 37.5 37.5 0 1 0 0 -50 Z"
          fill={`url(#${gradient2Id})`}
          opacity="0.9"
        />
        <circle cx="0" cy="0" r="8" fill={colors.center} />
      </g>
    </svg>
  )
}

// Dark mode aware logo that automatically switches
export const LogoAuto: React.FC<Omit<LogoProps, 'variant'>> = (props) => {
  return (
    <>
      {/* Show default in light mode */}
      <div className="dark:hidden">
        <Logo {...props} variant="default" />
      </div>
      {/* Keep same colors in dark mode for consistency */}
      <div className="hidden dark:block">
        <Logo {...props} variant="default" />
      </div>
    </>
  )
}