/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization enabled
  images: {
    unoptimized: false,
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dvkbgsaaf/**',
      },
    ],
  },
  // Optimize performance across all routes
  swcMinify: true,
}

module.exports = nextConfig
