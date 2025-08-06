'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'InvalidDomain':
        return {
          title: 'Personal Email Not Allowed',
          message: 'We require business email addresses for enterprise accounts. Personal email services like Gmail, Yahoo, and Hotmail are not permitted.',
          details: 'Please use your company email address to access AICostGuardian.',
          icon: '🏢'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this application.',
          details: 'Please contact your administrator or use a valid business email address.',
          icon: '🚫'
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during the authentication process.',
          details: 'Please try signing in again. If the problem persists, contact support.',
          icon: '⚠️'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  const blockedDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
  ]

  const allowedDomains = [
    'company.com', 'acme.org', 'business.net', 'enterprise.io'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <span className="text-2xl font-bold text-white">AICostGuardian</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-slate-700 bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">{errorInfo.icon}</div>
            <CardTitle className="text-2xl text-red-600">{errorInfo.title}</CardTitle>
            <CardDescription className="text-lg">
              {errorInfo.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{errorInfo.details}</p>
            </div>

            {error === 'InvalidDomain' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">❌ Not Allowed</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {blockedDomains.map((domain) => (
                      <div key={domain} className="flex items-center space-x-2">
                        <span className="text-red-500">•</span>
                        <span>user@{domain}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">✅ Examples of Allowed Domains</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {allowedDomains.map((domain) => (
                      <div key={domain} className="flex items-center space-x-2">
                        <span className="text-green-500">•</span>
                        <span>user@{domain}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 text-xl">💡</div>
                    <div>
                      <h4 className="text-blue-800 font-medium mb-1">Why We Require Business Emails</h4>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Enhanced security for enterprise data</li>
                        <li>• Better cost allocation and reporting</li>
                        <li>• Seamless team collaboration features</li>
                        <li>• Compliance with enterprise policies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/auth/signin" className="w-full">
                <Button className="w-full">
                  Try Again with Business Email
                </Button>
              </Link>
              
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-gray-600">
              Need help? <Link href="/about" className="text-blue-600 hover:text-blue-700 font-medium">Contact support</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}