import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('pls-session');
    console.log(sessionCookie)
    return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
    matcher: '/registrationx/:path*',
}