const { hostname } = require("os");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PRODUCTION_BASEURL: "http://192.168.100.1:2399/api/v1/",
    // PRODUCTION_BASEURL: "http://localhost:5000/api/v1/",
    DEVELOPMENT_BASEURL: "http://localhost:5000/api/v1/",
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRpZCI6NzQ3NDcsImlhdCI6MTcxMDgxNDQyOCwiZXhwIjoxNzQyMzcyMDI4fQ.X_2uVuilASQyg1kcRZjWtrn7X-r1bc5ZvsiGBhQIqbc`,
    HASH_SECRET: "leonides",
    JWT_SECRET_KEY: "leonides-prime-server",
    EXPIRY_DATE: "31-04-2026",
    TENANTID: "3",
  },
  images: {
    domains: ["localhost", "192.168.100.1", "192.168.100.1:2399"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
