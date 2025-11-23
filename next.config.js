/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable the automatic static optimization for the index page
  // so we can use Socket.IO
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
