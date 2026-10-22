const { hostname } = require("os");

const productionBaseUrl =
	process.env.PRODUCTION_BASEURL;
const developmentBaseUrl =
	process.env.DEVELOPMENT_BASEURL;

/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: process.env.PLS_BUILD_OUTPUT_DIR || ".next",
	reactStrictMode: true,
	// output: "standalone",
	env: {
		PRODUCTION_BASEURL: productionBaseUrl,
		DEVELOPMENT_BASEURL:
			process.env.PLS_DESKTOP_GENERIC === "true"
				? productionBaseUrl
				: developmentBaseUrl,
		TENANTID: process.env.TENANTID ,
		NEXT_PUBLIC_TENANTID:
			process.env.PRIME_PUBLIC_TENANTID || process.env.TENANTID ,
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
