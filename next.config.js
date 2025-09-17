/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
    instrumentationHook: false
  },
  // Optimize for production
  swcMinify: true,
  // Configure for API routes that use dynamic rendering
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ]
  },
  // Webpack configuration to suppress warnings
  webpack: (config, { isServer }) => {
    // Suppress critical dependency warnings for Sentry/Prisma
    config.module = config.module || {}
    config.module.exprContextCritical = false
    
    // Ignore specific warnings in production
    if (process.env.NODE_ENV === 'production') {
      config.ignoreWarnings = [
        {
          module: /@prisma\/instrumentation/,
        },
        {
          module: /require-in-the-middle/,
        },
        {
          message: /Critical dependency/,
        },
      ]
    }
    
    return config
  },
  // TypeScript configuration
  typescript: {
    // Don't fail production builds on TypeScript errors
    ignoreBuildErrors: false,
  },
  // ESLint configuration
  eslint: {
    // Don't fail production builds on ESLint errors
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig