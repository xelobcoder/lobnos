import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import {getBackendAuthorization, assertBackendTransport} from './lib/serverBackendAccess';
import {canAccessRolePage,canAccessDepartmentRequisitions,isMasterPlatformPath,roleWorkspace} from './lib/roleNavigationPolicy';

export interface UserPayload {
    user: {
        role: string;
        employeeid: number; branch?:number;
    };
    email: string;
    settings: any;
    tenantId?: number;
}

export async function verifyPrimeToken(token: string) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        const { payload } = await jwtVerify(token, secret);
        return { isValid: true, payload: (payload as unknown) as UserPayload };
    } catch (error) {
        return { isValid: false, payload: null };
    }
}

export async function proxy(request: NextRequest) {
    const publicRoutes = ["/", "/about", "/solutions", "/features", "/website/analytics", "/product-tour", "/pricing", "/industries", "/marketplace", "/join-facility", "/facilities", "/resources", "/contact", "/request-demo", "/terms", "/privacy-policy", "/facility-login", "/patient-portal", "/facility-dashboard", "/booking-status"];
    const pathname = request.nextUrl.pathname;
    if (publicRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route + '/')))) {
        const { publicSiteProxy } = await import('./website/publicSiteProxy');
        return publicSiteProxy(request);
    }
    const response = await routeRequest(request);
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
    return response;
}

async function routeRequest(request: NextRequest) {
    if(request.nextUrl.pathname==='/authentication/logout')return NextResponse.next();
    const isLoginPage = request.nextUrl.pathname === '/authentications/login';
    const patientLogin = request.nextUrl.pathname.startsWith('/patientportal');
    const adminPortal = request.nextUrl.pathname === '/patient-portal-admin' || request.nextUrl.pathname.startsWith('/patient-portal-admin/');
    const loginUrl = new URL(patientLogin ? '/patient-access/login' : '/authentications/login', request.url);
    if (adminPortal) loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
    const sessionToken = request.cookies.get('PLS-SESSION')?.value;

    if (!sessionToken && !isLoginPage) {
        return NextResponse.redirect(loginUrl);
    }

    if (sessionToken) {
        const { isValid, payload } = await verifyPrimeToken(sessionToken);

        if (!isValid && !isLoginPage) {
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('PLS-SESSION');
            response.cookies.delete('pls-prime-tenant-session');
            return response;
        }

        if (isValid && isLoginPage && payload) {
            const clearSession = () => {
                const response = NextResponse.next();
                for (const name of ['PLS-SESSION', 'pls-prime-tenant-session', 'loginsessionId']) response.cookies.delete(name);
                return response;
            };
            const tenantToken = request.cookies.get('pls-prime-tenant-session')?.value;
            const tenantId = Number(payload.tenantId);
            if (!tenantToken || !Number.isSafeInteger(tenantId) || tenantId <= 0) return clearSession();
            let verifiedConfiguration: unknown;
            try {
                const base = process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
                if (!base) throw new Error('Backend URL is not configured');
                const url = new URL('prime/validate-token', base);
                url.searchParams.set('tenantId', String(tenantId));
                const authorization = getBackendAuthorization();
                assertBackendTransport(url);
                const validation = await fetch(url, {
                    headers: { ...(authorization ? { Authorization: authorization } : {}), 'pls-prime-tenant-session': tenantToken, 'pls-session': sessionToken },
                    cache: 'no-store',
                    signal: AbortSignal.timeout(5000),
                });
                const session = await validation.json();
                verifiedConfiguration = session.moduleConfiguration || session.settings?.moduleConfiguration;
                if (validation.status === 401 || validation.status === 403 || session.isExpired === true) return clearSession();
                // A changed role is recovered by the workspace, but an outage must not cause a redirect loop.
                if (!(validation.ok && session.status === true) && session.code !== 'SESSION_ROLE_CHANGED') return NextResponse.next();
            } catch (error) {
                console.error('Unable to confirm the session before leaving login:', error);
                return NextResponse.next();
            }
            const { loginDestination } = await import('./lib/workspaceDestination');
            return NextResponse.redirect(new URL(loginDestination(
                payload.user?.role || '',
                verifiedConfiguration,
                new URL(request.url).searchParams.get('returnTo'),
            ), request.url));
        }

        if (isValid && payload && !isLoginPage) {
            const { user, email, settings } = payload as UserPayload;
            const role = user.role || "";
            const currentPath = request.nextUrl.pathname;
            const normalizedRole = role.toString().toLowerCase().trim();
            const activeRole=roleWorkspace(role);
            if(isMasterPlatformPath(currentPath)&&activeRole!=='superadmin')return NextResponse.redirect(new URL('/unauthorized',request.url));
            if(activeRole==='manager'&&currentPath.startsWith('/patientportal'))return NextResponse.redirect(new URL('/patient-portal-admin',request.url));
            if(['admin','superadmin'].includes(activeRole)){
                if(currentPath.startsWith('/patientportal'))return NextResponse.redirect(new URL('/patient-portal-admin',request.url));
                return NextResponse.next();
            }
            if(['/operations/laboratory/requisitions','/operations/imaging/ultrasound/requisitions'].includes(currentPath)){
                const department=currentPath.includes('/imaging/')?'imaging':'laboratory';
                if(!canAccessDepartmentRequisitions(role,department))return NextResponse.redirect(new URL('/unauthorized',request.url));
                // Require live, session-bound branch/department permission, even for head roles.
                const tenantToken=request.cookies.get('pls-prime-tenant-session')?.value;
                const tenantId=Number(payload.tenantId);
                if(!tenantToken||!Number.isSafeInteger(tenantId)||tenantId<=0)return NextResponse.redirect(new URL('/unauthorized',request.url));
                try{
                    const base=process.env.NODE_ENV==='development'?process.env.DEVELOPMENT_BASEURL:process.env.PRODUCTION_BASEURL;
                    if(!base)throw Error('Backend unavailable');
                    const url=new URL('inventory/department-stock/my-access',base);url.searchParams.set('tenantId',String(tenantId));
                    assertBackendTransport(url);
                    const response=await fetch(url,{headers:{...(getBackendAuthorization()?{Authorization:getBackendAuthorization()!}:{}),'pls-prime-tenant-session':tenantToken,'pls-session':sessionToken!},cache:'no-store',signal:AbortSignal.timeout(5000)});
                    const access=await response.json();
                    if(response.ok&&access?.success&&Number(access.employeeid)===Number(user.employeeid)&&Number(access.tenantId)===tenantId&&Number(access.branchid)>0&&(user.branch==null||Number(access.branchid)===Number(user.branch))&&Array.isArray(access.data)&&access.data.some((grant:any)=>grant.department===department&&(grant.can_request===true||grant.can_receive===true||grant.can_consume===true)))return NextResponse.next();
                    if(department==='imaging'&&response.ok&&access?.success&&Number(access.employeeid)===Number(user.employeeid)&&Number(access.tenantId)===tenantId&&Number(access.branchid)>0&&(user.branch==null||Number(access.branchid)===Number(user.branch))&&Array.isArray(access.data))return NextResponse.redirect(new URL('/operations/imaging?stockAccess=required',request.url));
                }catch(error){console.error('Unable to verify department access:',error);}
                return NextResponse.redirect(new URL('/unauthorized',request.url));
            }
            if(currentPath==='/operations/laboratory/test-panels'||currentPath.startsWith('/operations/laboratory/test-panels/')||currentPath==='/settings/applicationsettings/testpanels'||currentPath.startsWith('/settings/applicationsettings/testpanels/')){
                const tenantToken=request.cookies.get('pls-prime-tenant-session')?.value;
                const tenantId=Number(payload.tenantId);
                if(!tenantToken||!Number.isSafeInteger(tenantId)||tenantId<=0)return NextResponse.redirect(new URL('/unauthorized',request.url));
                try{
                    const base=process.env.NODE_ENV==='development'?process.env.DEVELOPMENT_BASEURL:process.env.PRODUCTION_BASEURL;
                    if(!base)throw Error('Backend unavailable');
                    const url=new URL('testpanel/my-access',base);url.searchParams.set('tenantId',String(tenantId));
                    const authorization=getBackendAuthorization();
                    assertBackendTransport(url);
                    const response=await fetch(url,{headers:{...(authorization?{Authorization:authorization}:{}),'pls-prime-tenant-session':tenantToken,'pls-session':sessionToken},cache:'no-store',signal:AbortSignal.timeout(5000)});
                    const access=await response.json();
                    if(response.ok&&access?.success&&access.can_manage===true&&Number(access.employeeid)===Number(user.employeeid)&&Number(access.tenantId)===tenantId&&Number(access.branchid)>0&&(user.branch==null||Number(access.branchid)===Number(user.branch))&&canAccessRolePage(role,currentPath,{...settings,testPanelsManagement:true}))return NextResponse.next();
                }catch(error){console.error('Unable to verify test-panel access:',error);}
                return NextResponse.redirect(new URL('/unauthorized',request.url));
            }
            if(!canAccessRolePage(role,currentPath,settings||{}))return NextResponse.redirect(new URL('/unauthorized',request.url));

            // Redirect /billing/expenses to /billing/expenses/expenselist for admin
            if (['admin', 'manager', 'accountant'].includes(role.toString().toLowerCase().trim()) &&
                currentPath === '/billing/expenses'
            ) { return NextResponse.redirect(new URL('/billing/expenses/expenselist', request.url)); }

            // Add response headers to prevent caching of authenticated pages
            const response = NextResponse.next();
            response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
            response.headers.set('Pragma', 'no-cache');
            response.headers.set('Expires', '0');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/about/:path*',
        '/solutions/:path*',
        '/features/:path*',
        '/website/analytics/:path*',
        '/product-tour/:path*',
        '/pricing/:path*',
        '/industries/:path*',
        '/marketplace/:path*',
        '/join-facility/:path*',
        '/facilities/:path*',
        '/resources/:path*',
        '/contact/:path*',
        '/request-demo/:path*',
        '/terms/:path*',
        '/privacy-policy/:path*',
        '/facility-login/:path*',
        '/patient-portal/:path*',
        '/facility-dashboard/:path*',
        '/booking-status/:path*',

        '/account/:path*',
        '/pharmacy/:path*',
        '/accounting/:path*',
        '/organization/:path*',
        '/clinicians/:path*',
        '/clinician/:path*',
        '/appointments/:path*',
        '/compliance/:path*',
        '/email-services/:path*',
        '/sms/:path*',
        '/human-resource/:path*',
        '/authentication/:path*',
        '/master/:path*',
        '/master-platform/:path*',
        '/platform/:path*',
        '/dashboard/:path*',
        '/authentications/login',
        '/billing/:path*',
        '/analytics/:path*',
        '/settings/:path*',
        '/operations/:path*',
        '/doctor/:path*',
        '/patientportal/:path*',
        '/patient-portal-admin/:path*',
        '/phelobotomy/:path*',
        '/phlebotomy/:path*',
        '/crm/:path*',
        '/sales/:path*',
        '/inventory/:path*',
        '/day-transaction-break-down',
        '/commission-payments/:path*',
        '/commissions/:path*',
        '/clinicians/commision-information',
        '/clinicians/commissions-payments-made',
        '/communications/:path*'
    ]
};
