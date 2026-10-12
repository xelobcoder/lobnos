import { NextRequest, NextResponse } from "next/server";
import { proxyBackendRequest } from "../../../../lib/serverBackendProxy";

export const runtime = "nodejs";

type RouteContext = {
	params: { path: string[] };
};

async function handleBackendRequest(request: NextRequest, { params }: RouteContext) {
	const baseUrl =
		process.env.NODE_ENV === "development"
			? process.env.DEVELOPMENT_BASEURL
			: process.env.PRODUCTION_BASEURL;
	return proxyBackendRequest(request, params.path, baseUrl);
}

export const GET = handleBackendRequest;
export const HEAD = handleBackendRequest;
export const POST = handleBackendRequest;
export const PUT = handleBackendRequest;
export const PATCH = handleBackendRequest;
export const DELETE = handleBackendRequest;
export const OPTIONS = handleBackendRequest;
