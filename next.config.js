/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BASEURL: 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXN1bHQiOmZhbHNlLCJpYXQiOjE2OTAzMjk5MzUsImV4cCI6MTY5MjE0NDMzNX0.O65RdVbdojJzGUaGASm_5MJop6Vi9QgyQwEZr5AYKbo`
  },
  images: {
    domains: ['localhost']
  }
}

module.exports = nextConfig;
