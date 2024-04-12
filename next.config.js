/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BASEURL: 'http://192.168.43.170:5000/api/v1',
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRpZCI6NzQ3NDcsImlhdCI6MTcxMDgxNDQyOCwiZXhwIjoxNzQyMzcyMDI4fQ.X_2uVuilASQyg1kcRZjWtrn7X-r1bc5ZvsiGBhQIqbc`,
    HASH_KEY: '7ruruu'
  },
  images: {
    domains: ['localhost','192.168.43.170']
  }
}


module.exports = nextConfig;
