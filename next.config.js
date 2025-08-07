/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true
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
  }
}

module.exports = nextConfig