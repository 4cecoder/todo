import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Build optimizations
  output: 'standalone',

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle analyzer for production builds
  ...(process.env['ANALYZE'] === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),

  // Headers optimization
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/todos',
        permanent: true,
      },
    ]
  },

  // Webpack configuration for additional optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime': 'react/jsx-runtime.js',
        'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
      })
    }

    // Enable tree shaking
    config.optimization.usedExports = true
    config.optimization.sideEffects = false

    return config
  },
}

export default nextConfig
