/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'images.unsplash.com', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
}

module.exports = nextConfig 