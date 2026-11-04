import type {NextRequest} from 'next/server';

export function secureSessionCookies(request: NextRequest): boolean {
    const url = new URL(request.url);
    const forwardedHttps = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() === 'https';
    if (url.protocol === 'https:' || forwardedHttps) return true;
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    return process.env.NODE_ENV === 'production' && !loopback && process.env.PLS_FACILITY_ALLOW_HTTP !== 'true';
}
