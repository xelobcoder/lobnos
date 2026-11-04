import {NextRequest, NextResponse} from 'next/server';
import {serverBackendRequest} from './serverBackendRequest';

export async function proxyBackendRequest(request: NextRequest, path: string[], baseUrl: string | undefined) {
    if (!baseUrl) return NextResponse.json({error:'Backend URL is not configured'}, {status:500});
    const origin = request.headers.get('origin');
    if (!['GET','HEAD','OPTIONS'].includes(request.method) && origin && origin !== new URL(request.url).origin) {
        return NextResponse.json({error:'Invalid request origin'}, {status:403});
    }
    try {
        const endpoint = path.map(encodeURIComponent).join('/') + new URL(request.url).search;
        const upstream = await serverBackendRequest(endpoint, {
            method: request.method,
            headers: request.headers,
            body: ['GET','HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
        }, false, undefined, baseUrl);
        const headers = new Headers(upstream.headers);
        for (const name of ['connection','content-encoding','content-length','transfer-encoding']) headers.delete(name);
        headers.set('Cache-Control','private, no-store, max-age=0');
        headers.set('CDN-Cache-Control','no-store');
        headers.set('Cloudflare-CDN-Cache-Control','no-store');
        return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
    } catch {
        return NextResponse.json({error:'Backend request failed'}, {status:502});
    }
}
