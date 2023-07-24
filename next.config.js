/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BASEURL: 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXN1bHQiOlt7IkVNUExPWUVFSUQiOjI4LCJVU0VSTkFNRSI6ImFkbWluIiwiUk9MRSI6ImFkbWluIiwiUEFTU1dPUkQiOiIkMmIkMTAkTk02WVFoYklpYklwa3BBQldSRWEwdVpDNkNucjY1RHpJMHBYNmM4RGZkWi9IeThoMG5rcHEiLCJEQVRFX0NSRUFURUQiOiIyMDIzLTA3LTAzVDIzOjAwOjAwLjAwMFoiLCJUSU1FIjoiMjA6MzA6MzQuMDAwMDAwIiwiUkVGUkVTSF9UT0tFTiI6bnVsbCwiREVMRVRFViI6IkZBTFNFIiwiRURJVFYiOiJGQUxTRSIsIlJFQURWIjoiVFJVRSIsIkNSRUFURVYiOiJGQUxTRSJ9XSwiaWF0IjoxNjg4NTAwMDAzLCJleHAiOjE2OTAzMTQ0MDN9.xon_yoMLuWC57cPc91TtSAWmH4r7HJB5b2HQBoKnPOo`
  },
  images: {
    domains: ['localhost']
  }
}

module.exports = nextConfig;
