import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export interface UserPayload {
    user: {
        role: string;
        employeeid: number
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

export async function middleware(request: NextRequest) {
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
            if (role === 'clinician') return NextResponse.redirect(new URL('/doctor', request.url));
            if (role === 'patient') return NextResponse.redirect(new URL('/patientportal', request.url));
            if (role === 'marketer') return NextResponse.redirect(new URL('/crm/acquisition', request.url));
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (isValid && payload && !isLoginPage) {
            const { user, email, settings } = payload as UserPayload;
            const role = user.role || "";
            const currentPath = request.nextUrl.pathname;
            const normalizedRole = role.toString().toLowerCase().trim();
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

            if (currentPath.startsWith('/doctor') && !['clinician', 'admin', 'super admin'].includes(normalizedRole)) {
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
