import { NextRequest, NextResponse } from "next/server";
import { getBackendAuthorization } from "./serverBackendAccess";

export async function proxyBackendRequest(
	request: NextRequest,
	path: string[],
	baseUrl: string | undefined,
) {
	if (!baseUrl) {
		return NextResponse.json({ error: "Backend URL is not configured" }, { status: 500 });
	}

	let target: URL;
	try {
		target = new URL(path.map(encodeURIComponent).join("/"), baseUrl);
	} catch {
		return NextResponse.json({ error: "Backend URL is invalid" }, { status: 500 });
	}
	target.search = new URL(request.url).search;

	const headers = new Headers(request.headers);
	for (const name of ["authorization", "connection", "content-length", "host", "transfer-encoding"]) {
		headers.delete(name);
	}
	const authorization = getBackendAuthorization();
	if (authorization) headers.set("authorization", authorization);

	try {
		const upstream = await fetch(target, {
			method: request.method,
			headers,
			cache: "no-store",
			body: ["GET", "HEAD"].includes(request.method)
				? undefined
				: await request.arrayBuffer(),
		});
		const responseHeaders = new Headers(upstream.headers);
		for (const name of ["connection", "content-encoding", "content-length", "transfer-encoding"]) {
			responseHeaders.delete(name);
		}
		responseHeaders.set('Cache-Control', 'private, no-store, max-age=0');
		responseHeaders.set('CDN-Cache-Control', 'no-store');
		responseHeaders.set('Cloudflare-CDN-Cache-Control', 'no-store');
		return new Response(upstream.body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error("Backend proxy request failed", error);
		return NextResponse.json({ error: "Backend request failed" }, { status: 502 });
	}
}
