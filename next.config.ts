import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@/components/ui',
      '@/components/dashboard',
      '@/lib/utils',
      '@/lib/hooks'
    ],
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Code splitting for responsive utilities
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate chunk for responsive utilities
            responsive: {
              name: 'responsive',
              test: /[\\/]src[\\/]lib[\\/](utils|hooks)[\\/]responsive/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Separate chunk for chart components
            charts: {
              name: 'charts',
              test: /[\\/]src[\\/]components[\\/](ui|dashboard)[\\/].*Chart/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Separate chunk for UI components
            ui: {
              name: 'ui',
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            }
          }
        }
      };
    }

    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false
    };

    return config;
  },

  // Compression
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
