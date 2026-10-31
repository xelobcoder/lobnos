import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import {getBackendAuthorization} from './lib/serverBackendAccess';
import {canAccessRolePage,isMasterPlatformPath,roleWorkspace} from './lib/roleNavigationPolicy';

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
            const role = payload.user?.role?.toLowerCase?.() || '';
            const returnTo = new URL(request.url).searchParams.get('returnTo');
            if (['admin', 'manager','super-admin'].includes(role) && returnTo && /^\/patient-portal-admin(?:\/(?:access|settings))?$/.test(returnTo)) {
                return NextResponse.redirect(new URL(returnTo, request.url));
            }
            if (role.replace(/[\s_-]/g, '') === 'superadmin') return NextResponse.redirect(new URL('/settings/facilities', request.url));
            if (['doctor','medicalofficer','consultant','nurse','pharmacydoctor','pharmacynurse'].includes(role.replace(/[\s_-]/g,''))) return NextResponse.redirect(new URL('/doctor', request.url));
            if (role === 'clinician') return NextResponse.redirect(new URL('/doctor', request.url));
            if (role === 'patient') return NextResponse.redirect(new URL('/patientportal', request.url));
            if (role.replace(/[\s_-]/g,'').startsWith('pharmacy')||role==='pharmacist') return NextResponse.redirect(new URL('/pharmacy', request.url));
            if (role === 'marketer') return NextResponse.redirect(new URL('/crm/acquisition', request.url));
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (isValid && payload && !isLoginPage) {
            const { user, email, settings } = payload as UserPayload;
            const role = user.role || "";
            const currentPath = request.nextUrl.pathname;
            const normalizedRole = role.toString().toLowerCase().trim();
            if(currentPath==='/account/roles'||currentPath==='/account/staff'){if(['patient','clinician'].includes(normalizedRole))return NextResponse.redirect(new URL('/unauthorized',request.url));return NextResponse.next();}
            const activeRole=roleWorkspace(role);
            if(isMasterPlatformPath(currentPath)&&activeRole!=='superadmin')return NextResponse.redirect(new URL('/unauthorized',request.url));
            if(['admin','superadmin'].includes(activeRole)){
                if(currentPath.startsWith('/patientportal'))return NextResponse.redirect(new URL('/patient-portal-admin',request.url));
                return NextResponse.next();
            }
            if(['/operations/laboratory/requisitions','/operations/imaging/ultrasound/requisitions'].includes(currentPath)){
                // Require live, session-bound branch/department permission, even for head roles.
                const tenantToken=request.cookies.get('pls-prime-tenant-session')?.value;
                const tenantId=Number(payload.tenantId);
                if(!tenantToken||!Number.isSafeInteger(tenantId)||tenantId<=0)return NextResponse.redirect(new URL('/unauthorized',request.url));
                try{
                    const base=process.env.NODE_ENV==='development'?process.env.DEVELOPMENT_BASEURL:process.env.PRODUCTION_BASEURL;
                    if(!base)throw Error('Backend unavailable');
                    const url=new URL('inventory/department-stock/my-access',base);url.searchParams.set('tenantId',String(tenantId));
                    const response=await fetch(url,{headers:{...(getBackendAuthorization()?{Authorization:getBackendAuthorization()!}:{}),'pls-prime-tenant-session':tenantToken,'pls-session':sessionToken!},cache:'no-store',signal:AbortSignal.timeout(5000)});
                    const access=await response.json();const department=currentPath.includes('/imaging/')?'imaging':'laboratory';
                    if(response.ok&&access?.success&&Number(access.employeeid)===Number(user.employeeid)&&Number(access.tenantId)===tenantId&&Number(access.branchid)>0&&(user.branch==null||Number(access.branchid)===Number(user.branch))&&Array.isArray(access.data)&&access.data.some((grant:any)=>grant.department===department&&(grant.can_request===true||grant.can_receive===true||grant.can_consume===true)))return NextResponse.next();
                }catch{}
                return NextResponse.redirect(new URL('/unauthorized',request.url));
            }
            if(!canAccessRolePage(role,currentPath,settings||{}))return NextResponse.redirect(new URL('/unauthorized',request.url));
            if(['crm','cashier','marketer'].includes(activeRole))return NextResponse.next();
            // Pharmacy staff enter their own workspace; API authorization enforces the same boundary.
            const roleKey=normalizedRole.replace(/[\s_-]/g,'');
            if(['pharmacydoctor','pharmacynurse'].includes(roleKey)&&currentPath.startsWith('/doctor'))return NextResponse.next();
            if(roleKey.startsWith('pharmacy')||roleKey==='pharmacist') {
                if(!currentPath.startsWith('/pharmacy')&&!['/authentication/logout','/unauthorized'].includes(currentPath))return NextResponse.redirect(new URL('/pharmacy',request.url));
                return NextResponse.next();
            }
            if(currentPath.startsWith('/pharmacy')&&!['admin','superadmin'].includes(roleKey))return NextResponse.redirect(new URL('/unauthorized',request.url));
            if ((currentPath === '/patient-portal-admin' || currentPath.startsWith('/patient-portal-admin/') || currentPath === '/crm/patient-portal') && !['admin', 'manager'].includes(normalizedRole)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            if (currentPath.startsWith('/patientportal') && ['admin', 'manager'].includes(normalizedRole)) {
                return NextResponse.redirect(new URL('/patient-portal-admin', request.url));
            }
            // Patient pages only serve patients; administrators have their own portal workspace.
            if (currentPath.startsWith('/patientportal') && normalizedRole !== 'patient') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            if (normalizedRole.replace(/[\s_-]/g, '') === 'superadmin') {
                const response = NextResponse.next();
                response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
                response.headers.set('Pragma', 'no-cache');
                response.headers.set('Expires', '0');
                return response;
            }

            if (currentPath === '/settings/facilities' || currentPath.startsWith('/settings/facilities/')) {
                if (normalizedRole.replace(/[\s_-]/g, '') !== 'superadmin') {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
                const response = NextResponse.next();
                response.headers.set('Cache-Control', 'no-store, private');
                return response;
            }

            if (currentPath.startsWith('/doctor') && !['clinician','admin','manager','superadmin','doctor','medicalofficer','consultant','nurse','nursing','pharmacydoctor','pharmacynurse'].includes(roleKey)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            if (normalizedRole === "clinician") {
                if (!currentPath.startsWith('/doctor')) {
                    return NextResponse.redirect(new URL('/doctor', request.url));
                }
                return NextResponse.next();
            }

            if (normalizedRole === "patient") {
                if (!currentPath.startsWith('/patientportal')) {
                    return NextResponse.redirect(new URL('/patientportal', request.url));
                }
                return NextResponse.next();
            }

            if (normalizedRole === 'marketer') {
                const allowed = currentPath === '/crm' || currentPath === '/crm/acquisition' || currentPath.startsWith('/crm/leads');
                if (!allowed) return NextResponse.redirect(new URL('/crm/acquisition', request.url));
                return NextResponse.next();
            }
            // Check CRM access first
            if (currentPath.startsWith("/crm")) {
                if (!["admin", "manager", "customer service representative", 'scientist', 'sonographer'].includes(role.toString().toLowerCase().trim())) {
                    if (role == "storekeeper") {
                        return NextResponse.redirect(new URL('/inventory', request.url));
                    } else {
                        return NextResponse.next();
                    }

                } else {
                    return NextResponse.next();
                }
            }

            if (role === "sonographer") {
                if (!currentPath.startsWith('/operations/imaging')) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
                return NextResponse.next();
            }

            // Handle lab scientist access
            if (role === "scientist") {
                if (!currentPath.startsWith('/operations/laboratory') && !currentPath.startsWith('/operations/phelobotomy') &&
                    !currentPath.startsWith('/phelobotomy') && !currentPath.startsWith('/operations/phlebotomy')
                    && (currentPath.startsWith('/billing') && settings?.allowScientistToRegisterClient == 0) && !currentPath.startsWith('/phlebotomy')) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
                return NextResponse.next();
            }

            // Handle storekeeper access
            if (!["admin", "manager", "accountant"].includes(role.toString().toLowerCase().trim())) {

                const restrictedPaths = [
                    '/settings',
                    '/billing/billing-sessions',
                    '/billing/settings/night-adjustments',
                    '/billing/billing-strategy/strategies',
                    '/day-transaction-break-down',
                    '/commission-payments',
                    '/inventory/analytics',
                    '/billing/expenses/invoices',
                    '/billing/expenses/reversed-payments',
                    '/billing/settings/night-adjustments',
                    '/operations/laboratory/auditlogs',
                    '/operations/laboratory/turnaroundtime',
                    '/expenses/reversed-payments',
                    '/clinicians/commision-information',
                    '/clinicians/commissions-payments-made',
                    '/operations/laboratory/auditlogs',
                    '/communications'
                ];

                if (restrictedPaths.some(path => currentPath.startsWith(path))) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
            }

            // Only admin, manager, and storekeeper can access inventory
            if (currentPath.startsWith('/inventory') && !["manager", "admin", "storekeeper", 'accountant'].includes(role)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            // Analytics access restricted to admin and super admin only
            if (currentPath.startsWith('/analytics') && !["admin", "super admin"].includes(role.toString().toLowerCase().trim())) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

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
        '/clinicians/commision-information',
        '/clinicians/commissions-payments-made',
        '/communications'
    ]
};
