/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    BASEURL: 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVGlpZnUgSGFtemEiLCJwYXNzIjoiYWRtaW4iLCJyb2xlIjoiTGFiIFRlY2huaWNpYW4iLCJpYXQiOjE2ODE1NjY3NTUsImV4cCI6MTY4MzM4MTE1NX0.ehlG26b2A4tb9XkIiG6swAc3wQorjiNQIhRhbY78YU0`
  },
}

module.exports = nextConfig;
