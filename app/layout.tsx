import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import NavigationProgress from '@/components/NavigationProgress'
import NextAuthSessionProvider from '@/components/SessionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import DemoDataProvider from '@/components/DemoDataProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@/lib/analytics'
import { SiteWideNotificationBanner } from '@/components/notifications/SiteWideNotificationBanner'
import { CSRFProvider } from '@/components/csrf-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Cost Guardian - Enterprise AI Cost Management Platform',
  description: 'Track, optimize, and control AI costs across OpenAI, Claude, Gemini, and more. Real-time monitoring, usage analytics, and intelligent cost management for enterprises.',
  keywords: 'AI cost management, AI usage tracking, OpenAI costs, Claude API costs, Gemini costs, AI billing, enterprise AI management, AI analytics',
  authors: [{ name: 'AI Cost Guardian Team' }],
  creator: 'AI Cost Guardian',
  publisher: 'AI Cost Guardian',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aicostguardian.com'),
  openGraph: {
    title: 'AI Cost Guardian - Enterprise AI Cost Management',
    description: 'Track, optimize, and control AI costs across all providers. Real-time monitoring and intelligent cost management.',
    url: 'https://aicostguardian.com',
    siteName: 'AI Cost Guardian',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'AI Cost Guardian - Enterprise AI Cost Management Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Cost Guardian - Enterprise AI Cost Management',
    description: 'Track, optimize, and control AI costs across all providers. Real-time monitoring and intelligent cost management.',
    images: ['/og-image.svg'],
    creator: '@aicostguardian',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.png',
        color: '#9333ea',
      },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
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
            <CSRFProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <DemoDataProvider>
                  <NavigationProgress />
                  <SiteWideNotificationBanner />
                  <Navigation />
                  {children}
                  <Toaster position="top-right" richColors />
                  <Analytics />
                  <GoogleAnalytics />
                </DemoDataProvider>
              </ThemeProvider>
            </CSRFProvider>
          </NextAuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}