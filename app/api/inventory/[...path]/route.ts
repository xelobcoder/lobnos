import { NextRequest } from "next/server";
import { proxyBackendRequest } from "../../../../lib/serverBackendProxy";

export const runtime = "nodejs";

type RouteContext = {
	params: Promise<{ path: string[] }>;
};

async function handleInventoryRequest(request: NextRequest, { params }: RouteContext) {
	const { path } = await params;
	return proxyBackendRequest(request, path, process.env.PSL_INVEN_ROUTE);
}

export const GET = handleInventoryRequest;
export const HEAD = handleInventoryRequest;
export const POST = handleInventoryRequest;
export const PUT = handleInventoryRequest;
export const PATCH = handleInventoryRequest;
export const DELETE = handleInventoryRequest;
export const OPTIONS = handleInventoryRequest;
