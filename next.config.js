/** @type {import('next').NextConfig} */
import dynamic from 'next/dynamic'
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: {
    globalObject: 'this',

  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      require('./scripts/generate-sitemap')
    }

    return config
  },
  ssr: false,
}

module.exports = nextConfig
