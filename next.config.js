const { hostname } = require("os");

const productionBaseUrl =
	process.env.PRODUCTION_BASEURL;
const developmentBaseUrl =
	process.env.DEVELOPMENT_BASEURL;

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [{ source: '/api/:path*', headers: [
            { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
            { key: 'CDN-Cache-Control', value: 'no-store' },
            { key: 'Cloudflare-CDN-Cache-Control', value: 'no-store' },
        ] }];
    },
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
		remotePatterns: [
			{ protocol: "http", hostname: "localhost", port: "", pathname: "/**" },
			{ protocol: "http", hostname: "localhost", port: "2300", pathname: "/**" },
			{ protocol: "https", hostname: "pls.primelabsys.com", port: "", pathname: "/**" },
			{ protocol: "http", hostname: "192.168.0.45", port: "2399", pathname: "/**" },
			{ protocol: "http", hostname: hostname().toLowerCase(), port: "2300", pathname: "/api/v1/**" },
			{ protocol: "http", hostname: "192.168.0.94", port: "2300", pathname: "/**" },
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

module.exports = nextConfig;
