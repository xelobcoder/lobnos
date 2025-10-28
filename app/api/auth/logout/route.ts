import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Clear the session cookies
        cookies().delete('PLS-SESSION');
        cookies().delete('pls-prime-tenant-session');

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
