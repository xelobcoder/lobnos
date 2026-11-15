import { NextRequest, NextResponse } from "next/server";
import { assertBackendTransport, getBackendAuthorization } from "../../../../lib/serverBackendAccess";
import { isSameOriginRequest } from "../../../../lib/requestOrigin";
import { secureSessionCookies } from "../../../../lib/sessionCookies";

export async function POST(request: NextRequest) {
    if (!request.headers.get("origin") || !isSameOriginRequest(request)) {
        return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const isForm = request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded");
    function failure(message: string, status: number) {
        const code = status === 401 ? "invalid" : status === 429 ? "rate" : "unavailable";
        return isForm ? NextResponse.redirect(new URL("/master-platform/login?error=" + code, request.url), 303)
            : NextResponse.json({ error: message }, { status });
    }
    try {
        const input = isForm ? Object.fromEntries(await request.formData()) : await request.json();
        const logout = input?.action === "logout";
        const change = input?.action === "credentials";
        const base = process.env.NODE_ENV === "development" ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
        if (!base) throw new Error("Backend is not configured");
        const url = new URL(`platform/master/${change ? "account" : logout ? "logout" : "login"}`, base.endsWith("/") ? base : base + "/");
        assertBackendTransport(url);
        const authorization = getBackendAuthorization();
        const current = request.cookies.get("pls-master-session")?.value;
        if (change && !current) return NextResponse.json({ error: "Sign in again before changing credentials" }, { status: 401 });
        const response = await fetch(url, {
            method: change ? "PUT" : "POST", cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15000),
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
                ...((logout || change) && current ? { "x-pls-master-session": current } : {}),
            },
            body: change ? JSON.stringify({ username: input?.username, currentPassword: input?.currentPassword, newPassword: input?.newPassword })
                : logout ? "{}" : JSON.stringify({ username: input?.username, password: input?.password }),
        });
        const result = await response.json();
        if (change) {
            if (!response.ok) return NextResponse.json({ error: result.message || "Could not update credentials" }, { status: response.status });
            const output = NextResponse.json({ changed: result.result?.changed === true });
            if (result.result?.changed === true) output.cookies.delete("pls-master-session");
            return output;
        }
        if (!response.ok) return failure(result.message || "Master sign-in is unavailable", response.status);
        const output = isForm ? NextResponse.redirect(new URL("/master-platform", request.url), 303) : NextResponse.json({ success: true });
        if (logout) output.cookies.delete("pls-master-session");
        else {
            const expires = new Date(result.expiresAt);
            if (!/^[a-f0-9]{64}$/.test(result.secret) || !Number.isFinite(expires.getTime()) || expires <= new Date()) throw Error("Invalid session");
            output.cookies.set("pls-master-session", result.secret, {
                httpOnly: true, secure: secureSessionCookies(request), sameSite: "lax", path: "/", expires,
            });
        }
        return output;
    } catch {
        return failure("Master session is unavailable", 503);
    }
}
