import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
  variant?: 'default' | 'white' | 'dark' | 'auto'
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '',
  textClassName = '',
  variant = 'auto'
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl' }
  }

  const { icon, text } = sizeMap[size]
  
  // Render the appropriate logo based on variant
  const renderLogo = (isDark: boolean = false) => {
    // For dark backgrounds or dark variant, use the purple geometric logo
    if (isDark || variant === 'dark') {
      return (
        <svg
          viewBox="0 0 256 256"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Purple geometric logo for dark backgrounds */}
          <g>
            {/* Top section - rectangle with curved corner */}
            <path d="M 40 60
                     L 160 60
                     L 160 30
                     C 160 30 190 30 210 50
                     L 226 66
                     L 226 140
                     L 40 140
                     Z" 
                  fill="#8B5CF6"/>
            
            {/* Bottom section - curved quarter */}
            <path d="M 176 176
                     L 226 176
                     L 226 226
                     C 200 226 176 202 176 176
                     Z"
                  fill="#8B5CF6"/>
          </g>
        </svg>
      )
    }
    
    // For light backgrounds, use the shield logo
    return (
      <svg
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shield with purple quadrants */}
        
        {/* Outer black shield border */}
        <path d="M 128 24 
                 C 148 24 168 32 188 32 
                 L 208 32 
                 L 208 112 
                 C 208 152 188 192 158 212
                 C 148 218 138 224 128 228
                 C 118 224 108 218 98 212
                 C 68 192 48 152 48 112
                 L 48 32
                 L 68 32
                 C 88 32 108 24 128 24 Z" 
              fill="#000000"/>
        
        {/* Inner shield area */}
        <g>
          {/* White background for inner shield */}
          <path d="M 128 44
                   C 144 44 160 50 176 50
                   L 188 50
                   L 188 110
                   C 188 142 172 174 148 192
                   C 141 197 134 201 128 204
                   C 122 201 115 197 108 192
                   C 84 174 68 142 68 110
                   L 68 50
                   L 80 50
                   C 96 50 112 44 128 44 Z"
                fill="white"/>
          
          {/* Top left quadrant - purple */}
          <path d="M 68 50 L 128 50 L 128 110 L 68 110 L 68 50 Z" 
                fill="#8B5CF6"/>
          
          {/* Bottom right quadrant - purple */}
          <path d="M 128 110 L 188 110 C 188 142 172 174 148 192 C 141 197 134 201 128 204 L 128 110 Z" 
                fill="#8B5CF6"/>
          
          {/* Black divider lines */}
          <rect x="126" y="50" width="4" height="154" fill="#000000"/>
          <rect x="68" y="108" width="120" height="4" fill="#000000"/>
        </g>
      </svg>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className={`${icon} relative flex items-center justify-center`}>
        {variant === 'auto' ? (
          <>
            {/* Show shield logo in light mode */}
            <div className="dark:hidden">
              {renderLogo(false)}
            </div>
            {/* Show purple geometric logo in dark mode */}
            <div className="hidden dark:block">
              {renderLogo(true)}
            </div>
          </>
        ) : (
          renderLogo(variant === 'dark')
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className={`ml-3 flex flex-col ${textClassName}`}>
          <span className={`font-bold ${text} text-foreground tracking-tight`}>
            AICostGuardian
          </span>
          <span className="text-xs text-muted-foreground -mt-1">Enterprise Edition</span>
        </div>
      )}
    </div>
  )
}

export const LogoSymbol: React.FC<{ className?: string; variant?: 'default' | 'white' | 'dark' | 'auto' }> = ({ 
  className = '',
  variant = 'auto'
}) => {
  const renderSymbol = (isDark: boolean = false) => {
    if (isDark || variant === 'dark') {
      return (
        <svg
          viewBox="0 0 256 256"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <g>
            <path d="M 40 60 L 160 60 L 160 30 C 160 30 190 30 210 50 L 226 66 L 226 140 L 40 140 Z" 
                  fill="#8B5CF6"/>
            <path d="M 176 176 L 226 176 L 226 226 C 200 226 176 202 176 176 Z"
                  fill="#8B5CF6"/>
          </g>
        </svg>
      )
    }
    
    return (
      <svg
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M 128 24 C 148 24 168 32 188 32 L 208 32 L 208 112 C 208 152 188 192 158 212 C 148 218 138 224 128 228 C 118 224 108 218 98 212 C 68 192 48 152 48 112 L 48 32 L 68 32 C 88 32 108 24 128 24 Z" 
              fill="#000000"/>
        <g>
          <path d="M 128 44 C 144 44 160 50 176 50 L 188 50 L 188 110 C 188 142 172 174 148 192 C 141 197 134 201 128 204 C 122 201 115 197 108 192 C 84 174 68 142 68 110 L 68 50 L 80 50 C 96 50 112 44 128 44 Z"
                fill="white"/>
          <path d="M 68 50 L 128 50 L 128 110 L 68 110 L 68 50 Z" 
                fill="#8B5CF6"/>
          <path d="M 128 110 L 188 110 C 188 142 172 174 148 192 C 141 197 134 201 128 204 L 128 110 Z" 
                fill="#8B5CF6"/>
          <rect x="126" y="50" width="4" height="154" fill="#000000"/>
          <rect x="68" y="108" width="120" height="4" fill="#000000"/>
        </g>
      </svg>
    )
  }
  
  if (variant === 'auto') {
    return (
      <>
        <div className="dark:hidden">
          {renderSymbol(false)}
        </div>
        <div className="hidden dark:block">
          {renderSymbol(true)}
        </div>
      </>
    )
  }
  
  return renderSymbol(variant === 'dark')
}

// Dark mode aware logo that automatically switches
export const LogoAuto: React.FC<Omit<LogoProps, 'variant'>> = (props) => {
  return <Logo {...props} variant="auto" />
}