/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		// BASEURL: "http://192.168.0.150:2379/api/v1/",
		BASEURL: "http://localhost:5000/api/v1/",
		PSL_INVEN_ROUTE: 'http://localhost:9000/api/v1',
		PLS_PDF_GENERATOR: 'http://localhost:8000/',
		NEXT_PUBLIC_ACCESS_TOKEN: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRpZCI6NzQ3NDcsImlhdCI6MTcxMDgxNDQyOCwiZXhwIjoxNzQyMzcyMDI4fQ.X_2uVuilASQyg1kcRZjWtrn7X-r1bc5ZvsiGBhQIqbc`,
		HASH_SECRET: "leonides",
		JWT_SECRET_KEY:"leonides-prime-server",
		TENANTID:"3",
	},
	images: {
		domains: ["localhost", "192.168.43.170",],
	},
};


module.exports = nextConfig;
