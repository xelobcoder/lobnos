import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { assertBackendTransport, getBackendAuthorization } from "../../../../lib/serverBackendAccess";
import { isSameOriginRequest } from "../../../../lib/requestOrigin";
import { POST as establishSession } from "../login/route";

const sessionCookies = ["PLS-SESSION", "pls-prime-tenant-session", "loginsessionId"];

async function backendCall(path: string, ownerToken: string, method: string, tenantId?: number, previousToken?: string) {
    const base = process.env.NODE_ENV === "development" ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
    if (!base) throw new Error("Backend is not configured");
    const url = new URL("platform/facilities/" + path, base.endsWith("/") ? base : base + "/");
    assertBackendTransport(url);
    const authorization = getBackendAuthorization();
    return fetch(url, {
        method,
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(30000),
        headers: {
            "Content-Type": "application/json",
            "x-pls-master-session": ownerToken,
            ...(authorization ? { Authorization: authorization } : {}),
            ...(previousToken ? { "x-pls-developer-session": previousToken } : {}),
        },
        body: method === "POST" ? JSON.stringify({ tenantId }) : undefined,
    });
}

export async function POST(request: NextRequest) {
    if (!request.headers.get("origin") || !isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    try {
        const input = await request.json();
        const returning = input?.action === "return";
        const tenantId = input?.tenantId;
        if (!returning && (!Number.isSafeInteger(tenantId) || tenantId <= 0)) {
            return NextResponse.json({ error: "Choose a client facility" }, { status: 400 });
        }
        const jar = await cookies();
        const owner = jar.get("pls-master-session")?.value;
        if (!owner) return NextResponse.json({ error: "Sign in to the master platform" }, { status: 401 });
        const currentSession = jar.get("PLS-SESSION")?.value;
        const current = currentSession
            ? await jwtVerify(currentSession, new TextEncoder().encode(process.env.JWT_SECRET_KEY)).catch(() => null)
            : null;
        const currentUser = current?.payload.user as { developerSupport?: boolean } | undefined;
        const previous = currentUser?.developerSupport ? jar.get("pls-prime-tenant-session")?.value : undefined;

        if (returning) {
            const verified = await backendCall("access", owner, "GET");
            if (!verified.ok) return NextResponse.json({ error: "The master session is unavailable. Sign in again." }, { status: verified.status });
            if (previous) {
                const closed = await backendCall("developer-session", owner, "DELETE", undefined, previous);
                if (!closed.ok) return NextResponse.json({ error: "The tenant session could not be closed. Try again." }, { status: closed.status });
            }
            if (!current || currentUser?.developerSupport) for (const name of sessionCookies) jar.delete(name);
            return NextResponse.json({ success: true });
        }

        const response = await backendCall("developer-session", owner, "POST", tenantId, previous);
        const result = await response.json();
        if (!response.ok || result?.status !== "success") {
            return NextResponse.json({ error: result?.message || "The facility could not be opened" }, { status: response.ok ? 502 : response.status });
        }
        const session = await establishSession(new NextRequest(new URL("/api/auth/login", request.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: true, ...result.result }),
        }));
        if (!session.ok) {
            await backendCall("developer-session", owner, "DELETE", undefined, result.result.accessToken).catch(() => undefined);
            return session;
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "The developer session could not be confirmed. Try again." }, { status: 503 });
    }
}
