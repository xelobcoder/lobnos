/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BASEURL: 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTI5MDE5ODUsImV4cCI6MTY5ODk0OTk4NX0.TKS9rSrzT-J_XxDFC6M_vHSjdbtDQOwSCpg0LSx0P4w`
  },
  images: {
    domains: ['localhost',"www.synlab.com.gh"]
  },
  transpilePackages: ['@mui/x-charts']
}


module.exports = nextConfig;
