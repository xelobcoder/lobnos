import type { NextRequest } from 'next/server';

export function requestOrigin(request: NextRequest): URL {
    const url = new URL(request.url);
    const forwardedProtocol = request.headers?.get('x-forwarded-proto')?.split(',')[0].trim();
    const forwardedHost = request.headers?.get('x-forwarded-host')?.split(',')[0].trim();
    const protocol = forwardedProtocol || url.protocol.slice(0, -1);
    const host = forwardedHost || request.headers?.get('host') || url.host;

    if (!['http', 'https'].includes(protocol) || /[\s/@?#\\]/.test(host)) throw new Error('Invalid request origin');
    return new URL(`${protocol}://${host}`);
}

export function isSameOriginRequest(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return true;
    try {
        return origin === requestOrigin(request).origin;
    } catch {
        return false;
    }
}
