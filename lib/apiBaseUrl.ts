/**
 * Resolves the PLS backend base URL for the environment the code runs in.
 *
 * Server-side rendering talks to the backend directly over the private
 * address configured for the deployment. Browser code must never use that
 * address: in facility mode the browser runs on a client laptop, where the
 * private backend address does not exist. Browser requests therefore use the
 * origin the page was served from and are proxied to the backend by the
 * Next.js server that rendered the page.
 */

export const API_PATH_PREFIX = "/api/v1/";

function serverBaseUrl(): string {
	const configured =
		process.env.NODE_ENV === "development"
			? process.env.DEVELOPMENT_BASEURL
			: process.env.PRODUCTION_BASEURL;

	return configured || API_PATH_PREFIX;
}

/**
 * Returns an absolute backend base URL ending in a trailing slash.
 */
export function getApiBaseUrl(): string {
	if (typeof window !== "undefined") {
		return new URL(API_PATH_PREFIX, window.location.origin).toString();
	}

	return serverBaseUrl();
}

/**
 * Builds a backend URL for the supplied endpoint.
 *
 * @param endpoint - Endpoint relative to the backend API root, such as
 * `settings/companyprofile/images`.
 */
export function buildApiUrl(endpoint: string): string {
	return new URL(endpoint.replace(/^\/+/, ""), getApiBaseUrl()).toString();
}

export function usesTenantQuery(endpoint: string): boolean {
	return !/^marketplace(?:\/|\?|$)/.test(endpoint.replace(/^\/+/, ""));
}

/**
 * Builds a same-origin backend path for URLs that are resolved by the browser
 * after server-side rendering, such as image `src` attributes.
 */
export function apiPath(endpoint: string): string {
	return `${API_PATH_PREFIX}${endpoint.replace(/^\/+/, "")}`;
}
