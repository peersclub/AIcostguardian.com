'use client'

import { useState } from 'react'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'

interface ApiKeyValidatorProps {
  provider: string
  apiKey: string
  onValidation?: (valid: boolean, details?: any) => void
  showResult?: boolean
  autoValidate?: boolean
}

export function ApiKeyValidator({ 
  provider, 
  apiKey, 
  onValidation,
  showResult = true,
  autoValidate = false
}: ApiKeyValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message?: string
    error?: string
    keyType?: string
  } | null>(null)

  const validateKey = async () => {
    if (!apiKey || !provider) {
      setValidationResult({
        valid: false,
        error: 'API key and provider are required'
      })
      return false
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch('/api/api-keys/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          provider,
          test: false // Just validate, don't test
        })
      })

      const data = await response.json()
      
      // Always ensure we have valid JSON response
      const result = {
        valid: data.valid || false,
        message: data.message,
        error: data.error,
        keyType: data.keyType
      }

      setValidationResult(result)
      
      if (onValidation) {
        onValidation(result.valid, result)
      }

      return result.valid
    } catch (error) {
      console.error('Validation error:', error)
      
      const errorResult = {
        valid: false,
        error: 'Failed to validate API key. Please check your connection and try again.'
      }
      
      setValidationResult(errorResult)
      
      if (onValidation) {
        onValidation(false, errorResult)
      }
      
      return false
    } finally {
      setIsValidating(false)
    }
  }

  // Auto-validate if requested and key is provided
  if (autoValidate && apiKey && !isValidating && !validationResult) {
    validateKey()
  }

  if (!showResult) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {isValidating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Validating...</span>
        </div>
      )}
      
      {validationResult && !isValidating && (
        <div className={`flex items-center gap-2 text-sm ${
          validationResult.valid ? 'text-green-600' : 'text-red-600'
        }`}>
          {validationResult.valid ? (
            <>
              <Check className="h-4 w-4" />
              <span>{validationResult.message || 'Valid'}</span>
              {validationResult.keyType && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                  {validationResult.keyType}
                </span>
              )}
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span>{validationResult.error || 'Invalid'}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Hook for validating API keys
 */
export function useApiKeyValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateApiKey = async (apiKey: string, provider: string) => {
    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch('/api/api-keys/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          provider,
          test: false
        })
      })

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response')
      }

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Validation failed')
      }

      return {
        valid: data.valid || false,
        message: data.message,
        keyType: data.keyType,
        details: data.details
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate API key'
      setError(errorMessage)
      return {
        valid: false,
        error: errorMessage
      }
    } finally {
      setIsValidating(false)
    }
  }

  return {
    validateApiKey,
    isValidating,
    error
  }
}