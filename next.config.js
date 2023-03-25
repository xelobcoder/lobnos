/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    BASEURL: 'http://localhost:5000/api/v1',
  },
}

module.exports = nextConfig;
