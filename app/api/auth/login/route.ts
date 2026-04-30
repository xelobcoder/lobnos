import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
    try {
        const response = await request.json();
        const { status, accessToken, user, email, settings, sessionExpiryTime,
            loginsessionId } = response

        if (!status || !accessToken || !user) {
            return NextResponse.json({ error: 'Invalid authentication data' }, { status: 400 });
        }

        // Create and sign JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        const signedToken = await new SignJWT({
            email,
            user,
            accessToken,
            settings
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('12h')
            .sign(secret);

        const { payload } = await jwtVerify(signedToken, secret);
        const maxAge = Math.floor((sessionExpiryTime - Date.now()) / 1000);
        // Set cookies
        cookies().set('PLS-SESSION', signedToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge
        });


        cookies().set('pls-prime-tenant-session', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge
        });


        cookies().set("loginsessionId", loginsessionId, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge
        })

        console.log(response, 'Reponse')

        const allowedRoles = ["storekeeper", "sonographer", "scientist", "manager", "admin", "customer service representative"];
        const userRole = user?.role?.toLowerCase();
        const isValidRole = allowedRoles.includes(userRole);

        if (isValidRole) {
            return NextResponse.json({
                status: true,
                role: userRole,
                message: 'Authentication successful'
            });
        } else {
            return NextResponse.json({
                error: 'Invalid role'
            }, { status: 403 });
        }

    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json({
            error: 'Authentication failed'
        }, { status: 500 });
    }
}
