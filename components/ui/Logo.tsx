import React from 'react'
import Image from 'next/image'

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

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className={`${icon} relative flex items-center justify-center`}>
        <Image
          src="/logo.png"
          alt="AI Cost Guardian"
          width={64}
          height={64}
          className="w-full h-full"
        />
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
  return (
    <Image
      src="/logo.png"
      alt="AI Cost Guardian"
      width={64}
      height={64}
      className={className}
    />
  )
}

// Dark mode aware logo that automatically switches
export const LogoAuto: React.FC<Omit<LogoProps, 'variant'>> = (props) => {
  return <Logo {...props} variant="auto" />
}