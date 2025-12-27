import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,

  // Image optimization
  images: {
    unoptimized: false, // Enable optimization for better LCP
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/photo-**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Compression
  compress: true,

  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {
    // Empty config to silence the warning
    // Turbopack handles optimizations automatically
  },

  // Redirects for old URLs and common mistakes
  async redirects() {
    return [
      // Redirect common property type searches to properties page
      {
        source: '/properties/1-bedroom',
        destination: '/properties',
        permanent: false,
      },
      {
        source: '/properties/2-bedroom',
        destination: '/properties',
        permanent: false,
      },
      {
        source: '/properties/studio',
        destination: '/properties',
        permanent: false,
      },
      // Redirect old property URLs to new slugs (if needed)
      {
        source: '/property/:slug',
        destination: '/properties/:slug',
        permanent: true,
      },
      {
        source: '/listings',
        destination: '/properties',
        permanent: true,
      },
      {
        source: '/listings/:slug',
        destination: '/properties/:slug',
        permanent: true,
      },
    ];
  },

  // Headers for performance
  async headers() {
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
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ['@supabase/supabase-js'],

  // Output file tracing (moved from experimental)
  outputFileTracingIncludes: {
    '/*': ['./public/**/*'],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // Performance and bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting in production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide-icons',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };

    return config;
  },
};

export default nextConfig;
