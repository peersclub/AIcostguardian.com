import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import NavigationProgress from '@/components/NavigationProgress'
import NextAuthSessionProvider from '@/components/SessionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import DemoDataProvider from '@/components/DemoDataProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AICostGuardian - Enterprise AI Cost Management',
  description: 'Track, optimize, and control AI costs across all providers. Real-time monitoring and intelligent cost management.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <NextAuthSessionProvider>
            <DemoDataProvider>
              <NavigationProgress />
              <Navigation />
              {children}
            </DemoDataProvider>
          </NextAuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}