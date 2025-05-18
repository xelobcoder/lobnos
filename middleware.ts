import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export interface UserPayload {
    user: {
        role: string;
        employeeid:number
    };
    email: string;
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
    const sessionToken = request.cookies.get('PLS-SESSION')?.value;

    if (!sessionToken && !isLoginPage) {
        return NextResponse.redirect(new URL('/authentications/login', request.url));
    }

    if (sessionToken) {
        const { isValid, payload } = await verifyPrimeToken(sessionToken);

        if (!isValid && !isLoginPage) {
            const response = NextResponse.redirect(new URL('/authentications/login', request.url));
            response.cookies.delete('PLS-SESSION');
            return response;
        }

        if (isValid && isLoginPage && payload) {
            return NextResponse.redirect(new URL('/', request.url));
        }  

        if (isValid && payload && !isLoginPage) {
            const { user, email } = payload as UserPayload;
            const role = user.role || "";
            const currentPath = request.nextUrl.pathname;

            // Handle sonographer access
            if (role === "sonographer") {
                if (!currentPath.startsWith('/operations/imaging')) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
                return NextResponse.next();
            }

            // Handle lab scientist access
            if (role === "labscientist") {
                if (!currentPath.startsWith('/operations/laboratory')) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
                return NextResponse.next();
            }

            // Handle admin and manager access
            if (role === "admin" || role === "manager") {
                if (currentPath.startsWith('/operations/imaging') || 
                    currentPath.startsWith('/operations/laboratory')) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
                return NextResponse.next();
            }
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
        '/operations/:path*'
    ]
};

