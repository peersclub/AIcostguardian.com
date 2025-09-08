'use client'

// import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Sentry.captureException(error)
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="mx-auto max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
            <p className="mb-4 text-gray-600">
              An unexpected error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error details (development only)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {error.message}
                  {error.stack}
                </pre>
              </details>
            )}
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  )
}