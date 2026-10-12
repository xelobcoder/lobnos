import { NextRequest } from "next/server";
import { proxyBackendRequest } from "../../../../lib/serverBackendProxy";

export const runtime = "nodejs";

type RouteContext = {
	params: { path: string[] };
};

async function handleInventoryRequest(request: NextRequest, { params }: RouteContext) {
	return proxyBackendRequest(request, params.path, process.env.PSL_INVEN_ROUTE);
}

export const GET = handleInventoryRequest;
export const HEAD = handleInventoryRequest;
export const POST = handleInventoryRequest;
export const PUT = handleInventoryRequest;
export const PATCH = handleInventoryRequest;
export const DELETE = handleInventoryRequest;
export const OPTIONS = handleInventoryRequest;
