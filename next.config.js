const { hostname } = require("os");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // PRODUCTION_BASEURL: `https://api.primelabsys.com/api/v1/`,
    PRODUCTION_BASEURL: `http://${hostname}:2300/api/v1/`,
    DEVELOPMENT_BASEURL: `http://${hostname}:2300/api/v1/`,
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRpZCI6NzQ3NDcsImlhdCI6MTcxMDgxNDQyOCwiZXhwIjoxNzQyMzcyMDI4fQ.X_2uVuilASQyg1kcRZjWtrn7X-r1bc5ZvsiGBhQIqbc`,
    HASH_SECRET: "leonides",
    JWT_SECRET_KEY: "leonides-prime-server",
    EXPIRY_DATE: "01-05-2027",
    TENANTID: "3",
  },
  images: {
    domains: [
      "localhost",
      "localhost:2300",
      "https://api.primelabsys.com",
      "https://api.primelabsys.com",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
