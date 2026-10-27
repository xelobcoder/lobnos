import {NextRequest, NextResponse} from 'next/server';
import {getRequestContext} from '../../../components/serverActions/requestHeaders';
import {getBackendAuthorization} from '../../../lib/serverBackendAccess';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({error:'Invalid organization'}, {status:400});
    const context = await getRequestContext();
    if (!context?.PLS_SESSION || !context?.PLS_PRIME_TENANT_SESSION || !context.tenantId) return NextResponse.json({error:'Authentication required'}, {status:401});
    try {
        const base = process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
        if (!base) throw Error('Backend not configured');
        const url = new URL('organization/profile/image', base);
        url.searchParams.set('id',String(id)); url.searchParams.set('tenantId',String(context.tenantId));
        const authorization = getBackendAuthorization();
        const response = await fetch(url, {headers:{'pls-session':context.PLS_SESSION,'pls-prime-tenant-session':context.PLS_PRIME_TENANT_SESSION,...(authorization?{Authorization:authorization}:{})},cache:'no-store'});
        if (!response.ok) return new Response(null,{status:response.status,headers:{'Cache-Control':'private, no-store'}});
        const type = response.headers.get('content-type')?.split(';')[0];
        if (!['image/png','image/jpeg'].includes(type || '')) return new Response(null,{status:502});
        return new Response(response.body,{headers:{'Content-Type':type!,'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'}});
    } catch { return NextResponse.json({error:'Unable to load organization logo'},{status:502}); }
}
