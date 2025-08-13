// Build-time configuration to suppress warnings
module.exports = {
  webpack: (config, { isServer }) => {
    // Suppress critical dependency warnings for Sentry/Prisma
    config.module = config.module || {}
    config.module.exprContextCritical = false
    
    // Ignore specific warnings
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
    
    return config
  },
  
  // Suppress specific build warnings
  typescript: {
    // Production builds will succeed even with TypeScript errors
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Production builds will succeed even with ESLint errors
    ignoreDuringBuilds: false,
  },
}