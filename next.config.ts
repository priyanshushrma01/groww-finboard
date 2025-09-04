/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  eslint: {
    // WARNING: This allows production builds to complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // WARNING: This allows production builds to complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
