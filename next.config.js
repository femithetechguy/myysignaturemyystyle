/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization enabled
  images: {
    unoptimized: false,
    minimumCacheTTL: 31536000, // 1 year
  },
  // Optimize performance across all routes
  swcMinify: true,
}

module.exports = nextConfig
