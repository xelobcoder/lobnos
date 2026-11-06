import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {getServerRequestContext} from '../../../../lib/serverRequestContext';
import {getBackendAuthorization, assertBackendTransport} from '../../../../lib/serverBackendAccess';
import {isSameOriginRequest} from '../../../../lib/requestOrigin';

export async function POST(request: NextRequest) {
    if (!isSameOriginRequest(request)) return NextResponse.json({error:'Invalid request origin'}, {status:403});

    let revocationConfirmed = false;
    try {
        const context = await getServerRequestContext();
        if (!context.PLS_PRIME_TENANT_SESSION) {
            revocationConfirmed = true;
        } else {
            const base = process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
            if (!base) throw new Error('Backend URL is not configured');
            const url = new URL('logins/logout', base.endsWith('/') ? base : base + '/');
            if (context.tenantId) url.searchParams.set('tenantId', String(context.tenantId));
            const authorization = getBackendAuthorization();
            assertBackendTransport(url);
            const response = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json','pls-prime-tenant-session':context.PLS_PRIME_TENANT_SESSION,...(authorization?{Authorization:authorization}:{})},body:'{}',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(15000)});
            if ([401, 403].includes(response.status)) {
                revocationConfirmed = true;
            } else if (response.ok) {
                const result = await response.json();
                revocationConfirmed = result.status === true || result.status === 'success';
            } else {
                console.error('Backend logout request returned an unexpected status:', response.status);
            }
        }
    } catch (error) {
        console.error('Backend session revocation failed during logout:', error);
    }

    if (!revocationConfirmed) {
        console.error('Backend session revocation was not confirmed; completing local logout.');
    }

    try {
        const jar = await cookies();
        for (const name of ['PLS-SESSION','pls-prime-tenant-session','loginsessionId']) jar.delete(name);
    } catch (error) {
        console.error('Local session cookies could not be cleared during logout:', error);
        return NextResponse.json({error:'Local session cookies could not be cleared. Please retry signing out.'}, {status:500});
    }

    return NextResponse.json({status:true,message:'Logout successful',revocationConfirmed});
}
