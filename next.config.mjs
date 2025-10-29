/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
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
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
