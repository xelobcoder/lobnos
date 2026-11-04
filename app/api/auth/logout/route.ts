import {assertBackendTransport} from '../../../../lib/serverBackendRequest';
import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {getServerRequestContext} from '../../../../lib/serverRequestContext';
import {getBackendAuthorization} from '../../../../lib/serverBackendAccess';

export async function POST(request: NextRequest) {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({error:'Invalid request origin'}, {status:403});
    try {
        const context = await getServerRequestContext();
        if (context.PLS_PRIME_TENANT_SESSION) {
            const base = process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
            if (!base) throw new Error('Backend URL is not configured');
            const url = new URL('logins/logout', base.endsWith('/') ? base : base + '/');
            if (context.tenantId) url.searchParams.set('tenantId', String(context.tenantId));
            const authorization = getBackendAuthorization();
            assertBackendTransport(url);
            const response = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json','pls-prime-tenant-session':context.PLS_PRIME_TENANT_SESSION,...(authorization?{Authorization:authorization}:{})},body:'{}',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(15000)});
            if (!response.ok && ![401,403].includes(response.status)) return NextResponse.json({error:'The session could not be revoked. Please retry signing out.'}, {status:502});
            if (response.ok) {
                const result = await response.json();
                if (result.status !== true && result.status !== 'success') return NextResponse.json({error:'The session could not be revoked. Please retry signing out.'}, {status:502});
            }
        }
        const jar = await cookies();
        for (const name of ['PLS-SESSION','pls-prime-tenant-session','loginsessionId']) jar.delete(name);
        return NextResponse.json({status:true,message:'Logout successful'});
    } catch {
        return NextResponse.json({error:'Logout could not be confirmed. Please retry.'}, {status:502});
    }
}
