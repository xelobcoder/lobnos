/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Prevent Next.js from bundling server-only packages that include
    // optional native/dialect dependencies (e.g. knex optional dialects).
    serverComponentsExternalPackages: ["knex", "mysql2"],
  },
};

module.exports = nextConfig;
