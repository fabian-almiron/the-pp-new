/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ TODO: Fix Stripe type errors (pre-existing issues)
  },
  images: {
    remotePatterns: [
      // Only allow HTTP for localhost in development
      ...(process.env.NODE_ENV !== 'production' ? [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '1337',
          pathname: '/uploads/**',
        },
        {
          protocol: 'http',
          hostname: '127.0.0.1',
          port: '1337',
          pathname: '/uploads/**',
        },
        {
          protocol: 'http',
          hostname: '::1',
          port: '1337',
          pathname: '/uploads/**',
        },
      ] : []),
      {
        protocol: 'https',
        hostname: 'vumbnail.com',
      },
      {
        protocol: 'https',
        hostname: 'dazzling-friends-80757c9c53.strapiapp.com', // Your Strapi Cloud domain
      },
      {
        protocol: 'https',
        hostname: 'dazzling-friends-80757c9c53.media.strapiapp.com', // Strapi Cloud media domain
      },
      {
        protocol: 'https',
        hostname: '*.strapiapp.com', // Wildcard for Strapi Cloud
      },
      {
        protocol: 'https',
        hostname: 'content.thepipedpeony.com', // New Strapi server domain
      },
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    // ✅ Security: Add SVG content security
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
