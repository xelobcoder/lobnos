import type { NextRequest } from 'next/server';

export function isSameOriginRequest(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return true;

    try {
        const parsedOrigin = new URL(origin);
        if (parsedOrigin.origin !== origin) return false;

        const requestUrl = new URL(request.url);
        const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
        const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
        const protocol = forwardedProtocol || requestUrl.protocol.slice(0, -1);
        const host = forwardedHost || request.headers.get('host') || requestUrl.host;

        if (!['http', 'https'].includes(protocol)) return false;
        return parsedOrigin.origin === new URL(`${protocol}://${host}`).origin;
    } catch {
        return false;
    }
}
