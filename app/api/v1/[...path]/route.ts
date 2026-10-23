import { NextRequest } from "next/server";
import { proxyBackendRequest } from "../../../../lib/serverBackendProxy";

export const runtime = "nodejs";

type RouteContext = {
	params: Promise<{ path: string[] }>;
};

async function handleBackendRequest(request: NextRequest, { params }: RouteContext) {
	const { path } = await params;
	const baseUrl =
		process.env.NODE_ENV === "development"
			? process.env.DEVELOPMENT_BASEURL
			: process.env.PRODUCTION_BASEURL;
	return proxyBackendRequest(request, path, baseUrl);
}

export const GET = handleBackendRequest;
export const HEAD = handleBackendRequest;
export const POST = handleBackendRequest;
export const PUT = handleBackendRequest;
export const PATCH = handleBackendRequest;
export const DELETE = handleBackendRequest;
export const OPTIONS = handleBackendRequest;
