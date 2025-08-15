import type { NextConfig } from "next";

// Railway environment detection
const isRailway = !!(process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_NAME);

const nextConfig: NextConfig = {
  // Railway-optimized output configuration
  output: isRailway ? 'standalone' : undefined,

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@/components/ui',
      '@/components/dashboard',
      '@/lib/utils',
      '@/lib/hooks'
    ],
    // Railway-specific optimizations
    ...(isRailway && {
      serverComponentsExternalPackages: ['mysql2'],
      optimizeCss: true,
      gzipSize: true,
    }),
  },

  // Railway-optimized bundle configuration
  webpack: (config, { dev, isServer, webpack }) => {
    // Railway-specific optimizations for production builds
    if (!dev && isRailway) {
      // Enable production optimizations
      config.optimization = {
        ...config.optimization,
        minimize: true,
        sideEffects: false,
        usedExports: true,
        providedExports: true,
        concatenateModules: true,
        flagIncludedChunks: true,
        occurrenceOrder: true,
        mangleWasmImports: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
      };

      // Railway memory-optimized chunk splitting
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20000,
        maxSize: isRailway ? 200000 : 244000, // Smaller chunks for Railway
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Framework chunk (React, Next.js)
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Vendor libraries
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            maxSize: isRailway ? 150000 : 200000,
          },
          // UI components chunk
          ui: {
            name: 'ui',
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Dashboard components
          dashboard: {
            name: 'dashboard',
            test: /[\\/]src[\\/]components[\\/]dashboard[\\/]/,
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Utilities and hooks
          utils: {
            name: 'utils',
            test: /[\\/]src[\\/]lib[\\/](utils|hooks)[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          }
        }
      };
    } else if (!dev && !isServer) {
      // Standard code splitting for non-Railway environments
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

    // Railway-specific webpack plugins
    if (isRailway && !dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.RAILWAY_ENVIRONMENT': JSON.stringify(process.env.RAILWAY_ENVIRONMENT || 'production'),
          'process.env.RAILWAY_PROJECT_ID': JSON.stringify(process.env.RAILWAY_PROJECT_ID || ''),
          'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
        })
      );

      // Optimize for Railway's memory constraints
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }

    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false
    };

    // Railway-specific module resolution
    if (isRailway) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Compression with Railway optimization
  compress: true,

  // Railway-optimized build settings
  ...(isRailway && {
    poweredByHeader: false,
    generateEtags: true,
    distDir: '.next',
  }),

  // Image optimization with Railway CDN support
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: isRailway ? 60 * 60 * 24 * 7 : 60 * 60 * 24 * 30, // 7 days for Railway, 30 days local
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Environment variables validation for Railway
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  },

  // Railway-optimized headers for performance and security
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      }
    ];

    // Add Railway-specific security headers
    if (isRailway) {
      securityHeaders.push(
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        },
        {
          key: 'X-Railway-Environment',
          value: process.env.RAILWAY_ENVIRONMENT || 'production'
        }
      );
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isRailway
              ? 'public, max-age=31536000, immutable, s-maxage=31536000'
              : 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Railway-optimized redirects and rewrites
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in Railway production
      ...(isRailway && process.env.NODE_ENV === 'production' ? [
        {
          source: '/(.*)',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://posyandu-management.up.railway.app/$1',
          permanent: true,
        },
      ] : []),
    ];
  },

  // Railway-specific API rewrites for backend communication
  async rewrites() {
    // Only apply rewrites in development or when API_URL is not set
    if (isRailway && process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:5000/api/:path*',
      },
    ];
  }
};

// Railway deployment logging
if (isRailway) {
  console.log('🚂 Railway Next.js Configuration Loaded');
  console.log(`📦 Project ID: ${process.env.RAILWAY_PROJECT_ID || 'Unknown'}`);
  console.log(`🔧 Service: ${process.env.RAILWAY_SERVICE_NAME || 'frontend'}`);
  console.log(`🌍 Environment: ${process.env.RAILWAY_ENVIRONMENT || 'production'}`);
  console.log(`🎯 Output Mode: ${nextConfig.output || 'default'}`);
  console.log(`🔗 API URL: ${process.env.NEXT_PUBLIC_API_URL || 'Not set'}`);
}

export default nextConfig;
