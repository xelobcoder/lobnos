/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BASEURL: 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTI1MTc0OTcsImV4cCI6MTY5Mjg2MzA5N30.o0H1DuP6svGEO4odstF73L6nh06xMkjzrB6Q91z7hMM`
  },
  images: {
    domains: ['localhost']
  }
}

module.exports = nextConfig;
