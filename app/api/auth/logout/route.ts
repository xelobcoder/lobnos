import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Clear the session cookies
        (await cookies()).delete('PLS-SESSION');
        (await cookies()).delete('pls-prime-tenant-session');
        (await cookies()).delete('loginsessionId');

        return NextResponse.json({ 
            status: true,
            message: 'Logout successful'
        });

    } catch (error) {
        return NextResponse.json({ 
            error: 'Logout failed' 
        }, { status: 500 });
    }
}
