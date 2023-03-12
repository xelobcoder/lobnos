/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: {
    globalObject: 'this',

  }
}

module.exports = nextConfig
