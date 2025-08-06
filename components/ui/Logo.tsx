import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '',
  textClassName = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', shield: 'text-xs' },
    md: { icon: 'w-10 h-10', text: 'text-xl', shield: 'text-sm' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', shield: 'text-base' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', shield: 'text-lg' }
  }

  const { icon, text, shield } = sizeMap[size]

  return (
    <div className={`flex items-center ${className}`}>
      {/* Shield Logo with AI Symbol */}
      <div className={`${icon} relative flex items-center justify-center`}>
        {/* Gradient Shield Background */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <path
            d="M20 2L4 8v12c0 8.84 6.88 17.12 16 18.96C29.12 37.12 36 28.84 36 20V8L20 2z"
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* AI Symbol in Shield */}
        <div className={`relative z-10 text-white font-bold ${shield} flex items-center justify-center`}>
          <span className="font-mono">AI</span>
        </div>
        
        {/* Shield Border Effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-lg"></div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className={`ml-3 flex flex-col ${textClassName}`}>
          <span className={`font-bold ${text} bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight`}>
            AICostGuardian
          </span>
          <span className="text-xs text-gray-500 -mt-1">Enterprise Edition</span>
        </div>
      )}
    </div>
  )
}

export const LogoSymbol: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 2L4 8v12c0 8.84 6.88 17.12 16 18.96C29.12 37.12 36 28.84 36 20V8L20 2z"
        fill="url(#logo-gradient)"
      />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="bold"
        fontFamily="monospace"
      >
        AI
      </text>
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}