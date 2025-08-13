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
        shield: '#ffffff',
        blue: '#e0e0e0',
        gray: '#f5f5f5',
        divider: '#d0d0d0'
      }
    } else if (variant === 'dark') {
      return {
        shield: '#1F2937',
        blue: '#2563EB',
        gray: '#374151',
        divider: '#111827'
      }
    }
    // Default colors
    return {
      shield: '#2B3544',
      blue: '#4A7FC7',
      gray: '#E8E8E8',
      divider: '#2B3544'
    }
  }
  
  const colors = getColors()

  return (
    <div className={`flex items-center ${className}`}>
      {/* Shield Logo */}
      <div className={`${icon} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 256 256"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Shield background */}
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
                fill={colors.shield}/>
          
          {/* Inner shield with quadrants */}
          <g>
            {/* Shield inner area - white background */}
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
                  fill={colors.gray}/>
            
            {/* Top left quadrant - blue */}
            <path d="M 68 50 L 128 50 L 128 110 L 68 110 L 68 50 Z" 
                  fill={colors.blue}/>
            
            {/* Bottom right quadrant - blue */}
            <path d="M 128 110 L 188 110 C 188 142 172 174 148 192 C 141 197 134 201 128 204 L 128 110 Z" 
                  fill={colors.blue}/>
            
            {/* Vertical divider */}
            <rect x="126" y="50" width="4" height="154" fill={colors.divider}/>
            
            {/* Horizontal divider */}
            <rect x="68" y="108" width="120" height="4" fill={colors.divider}/>
          </g>
        </svg>
        
        {/* Shadow effect for depth */}
        {variant === 'default' && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5 blur-md"></div>
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

export const LogoSymbol: React.FC<{ className?: string; variant?: 'default' | 'white' | 'dark' }> = ({ 
  className = '',
  variant = 'default'
}) => {
  const getColors = () => {
    if (variant === 'white') {
      return {
        shield: '#ffffff',
        blue: '#e0e0e0',
        gray: '#f5f5f5',
        divider: '#d0d0d0'
      }
    } else if (variant === 'dark') {
      return {
        shield: '#1F2937',
        blue: '#2563EB',
        gray: '#374151',
        divider: '#111827'
      }
    }
    return {
      shield: '#2B3544',
      blue: '#4A7FC7',
      gray: '#E8E8E8',
      divider: '#2B3544'
    }
  }
  
  const colors = getColors()
  
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield background */}
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
            fill={colors.shield}/>
      
      {/* Inner shield with quadrants */}
      <g>
        {/* Shield inner area */}
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
              fill={colors.gray}/>
        
        {/* Top left quadrant - blue */}
        <path d="M 68 50 L 128 50 L 128 110 L 68 110 L 68 50 Z" 
              fill={colors.blue}/>
        
        {/* Bottom right quadrant - blue */}
        <path d="M 128 110 L 188 110 C 188 142 172 174 148 192 C 141 197 134 201 128 204 L 128 110 Z" 
              fill={colors.blue}/>
        
        {/* Vertical divider */}
        <rect x="126" y="50" width="4" height="154" fill={colors.divider}/>
        
        {/* Horizontal divider */}
        <rect x="68" y="108" width="120" height="4" fill={colors.divider}/>
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
      {/* Show dark variant in dark mode */}
      <div className="hidden dark:block">
        <Logo {...props} variant="dark" />
      </div>
    </>
  )
}