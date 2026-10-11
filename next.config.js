const { hostname } = require("os");

const productionBaseUrl =
	process.env.PRODUCTION_BASEURL || `http://localhost:2300/api/v1/`;
const developmentBaseUrl =
	process.env.DEVELOPMENT_BASEURL || `http://${hostname()}:2300/api/v1/`;

// The browser is served by this Next.js server, which may run on a central
// facility server. Backend requests from the browser are proxied here so that
// client laptops never need to reach the backend address directly.
const backendBaseUrl =
	process.env.NODE_ENV === "development" ? developmentBaseUrl : productionBaseUrl;
const backendApiRoot = backendBaseUrl.replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "standalone",
	async rewrites() {
		return [
			{
				source: "/api/v1/:path*",
				destination: `${backendApiRoot}/:path*`,
			},
		];
	},
	// Generic desktop builds must not embed historical workstation tokens/secrets.
	env: process.env.PLS_DESKTOP_GENERIC === "true" ? {
		PRODUCTION_BASEURL: productionBaseUrl,
		DEVELOPMENT_BASEURL: productionBaseUrl,
	} : {
		PRODUCTION_BASEURL: productionBaseUrl,
		DEVELOPMENT_BASEURL: developmentBaseUrl,
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
			"http://192.168.0.45:2399",
			`http://${hostname}:2300/api/v1/`,
			"192.168.0.94:2300",
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

module.exports = nextConfig;
