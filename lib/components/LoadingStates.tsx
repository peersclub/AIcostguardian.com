'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      {label && (
        <p className="mt-2 text-sm text-gray-600">{label}</p>
      )}
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  )
}

interface SectionLoadingProps {
  height?: string
  message?: string
}

export const SectionLoading: React.FC<SectionLoadingProps> = ({
  height = '200px',
  message,
}) => {
  return (
    <div 
      className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
      style={{ minHeight: height }}
    >
      <LoadingSpinner size="lg" label={message} />
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rect' | 'circle'
  width?: string | number
  height?: string | number
  count?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200'
  
  const variantClasses = {
    text: 'rounded',
    rect: 'rounded-md',
    circle: 'rounded-full',
  }

  const style: React.CSSProperties = {
    width: width || (variant === 'circle' ? height : '100%'),
    height: height || (variant === 'text' ? '1em' : '20px'),
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface CardSkeletonProps {
  showImage?: boolean
  lines?: number
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showImage = false,
  lines = 3,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {showImage && (
        <Skeleton variant="rect" height="200px" className="mb-4" />
      )}
      <Skeleton variant="text" width="60%" height="24px" className="mb-2" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            width={i === lines - 1 ? "80%" : "100%"} 
          />
        ))}
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  visible: boolean
  message?: string
  fullScreen?: boolean
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  fullScreen = false,
}) => {
  if (!visible) return null

  const positionClasses = fullScreen 
    ? 'fixed inset-0' 
    : 'absolute inset-0'

  return (
    <div className={`${positionClasses} z-50 flex items-center justify-center`}>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      <div className="relative">
        <LoadingSpinner size="lg" label={message} />
      </div>
    </div>
  )
}

interface LazyLoadWrapperProps {
  loading: boolean
  error?: Error | null
  skeleton?: React.ReactNode
  children: React.ReactNode
  onRetry?: () => void
}

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  loading,
  error,
  skeleton,
  children,
  onRetry,
}) => {
  if (loading) {
    return <>{skeleton || <SectionLoading />}</>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-600 mb-2">Failed to load content</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}