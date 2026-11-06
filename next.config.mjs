import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep production checks from overwriting a running development server's assets.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Next.js built-in image optimization (Sharp on Vercel) for /public assets
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: [
      'date-fns',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      'three',
      '@react-three/fiber',
    ],
  },
  outputFileTracingExcludes: {
    '/gallery': [
      './public/gallery/**/*',
    ],
    '/*': [
      './public/gallery/**/*',
      './public/desktop-background/**/*',
      './public/mobile-background/**/*',
      './public/LoveStory/**/*',
      './public/Details/**/*',
      './public/**/*.{jpg,jpeg,png,webp,gif,mp3,mp4,mov}',
    ],
  },
  headers: async () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Add cache-control for HTML pages
          ...(isDevelopment
            ? [
                {
                  key: "Cache-Control",
                  value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
                },
              ]
            : [
                {
                  key: "Cache-Control",
                  value: "public, s-maxage=10, stale-while-revalidate=59",
                },
              ]),
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { 
            key: "Cache-Control", 
            value: isDevelopment 
              ? "no-store, no-cache, must-revalidate" 
              : "public, max-age=31536000, immutable" 
          }
        ],
      },
      {
        source: "/:all*\\.(js|css|svg|png|jpg|jpeg|gif|webp|ico|woff2?)",
        headers: [
          { 
            key: "Cache-Control", 
            value: isDevelopment 
              ? "no-store, no-cache, must-revalidate" 
              : "public, max-age=31536000, immutable" 
          }
        ],
      },
    ]
  },
};

export default withBundleAnalyzer(nextConfig);
