/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		PRODUCTION_BASEURL: "http://localhost:5000/api/v1/",
		DEVELOPMENT_BASEURL: "http://localhost:5000/api/v1/",
		PSL_INVEN_ROUTE: 'http://localhost:9000/api/v1',
		// PLS_PDF_GENERATOR: 'http://localhost:8000/',
		PLS_PDF_GENERATOR: 'http://http://localhost:8000/',
		NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRpZCI6NzQ3NDcsImlhdCI6MTcxMDgxNDQyOCwiZXhwIjoxNzQyMzcyMDI4fQ.X_2uVuilASQyg1kcRZjWtrn7X-r1bc5ZvsiGBhQIqbc`,
		HASH_SECRET: "leonides",
		JWT_SECRET_KEY: "leonides-prime-server",
		TENANTID: "3",
		HOST: "192.168.0.45"
	},
	images: {
		domains: ["localhost", "192.168.0.45", "192.168.0.45"],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};


module.exports = nextConfig;
