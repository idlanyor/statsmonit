/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable untuk mempercepat dev (no double-rendering)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports untuk mempercepat bundling
    optimizePackageImports: ['chart.js', 'react-chartjs-2', 'socket.io-client'],
  },
  // Skip type checking di dev untuk mempercepat
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
}

export default nextConfig
