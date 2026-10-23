import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
    try {
        const response = await request.json();
        const { status, accessToken, email, sessionExpiryTime,
            loginsessionId, tenantId: requestedTenantId } = response;
        const tenantId = Number(requestedTenantId);

        if (!status || !accessToken || !Number.isSafeInteger(tenantId) || tenantId <= 0) {
            return NextResponse.json({ error: 'Invalid authentication data' }, { status: 400 });
        }

        const backendBaseUrl = process.env.NODE_ENV === 'development'
            ? process.env.DEVELOPMENT_BASEURL
            : process.env.PRODUCTION_BASEURL;
        if (!backendBaseUrl) {
            throw new Error('Backend URL is not configured');
        }

        const validationUrl = new URL('prime/validate-token', backendBaseUrl);
        validationUrl.searchParams.set('tenantId', String(tenantId));
        const validationResponse = await fetch(validationUrl, {
            method: 'GET',
            headers: {
                Cookie: `pls-prime-tenant-session=${encodeURIComponent(accessToken)}`,
                'pls-prime-tenant-session': accessToken,
                cache: 'no-store',
            },
            cache: 'no-store',
        });
        const validatedSession = await validationResponse.json();
        if (!validationResponse.ok || validatedSession?.status !== true) {
            return NextResponse.json(
                { error: validatedSession?.message || 'The session could not be verified for this tenant' },
                { status: 401 },
            );
        }

        const user = validatedSession?.user?.user;
        const settings = validatedSession?.settings;
        const allowedRoles = ["marketer", "storekeeper", "sonographer", "accountant", "scientist", "manager", "admin", "super-admin", "customer service representative", "patient", "clinician"];
        const userRole = user?.role?.toLowerCase();
        if (!user || !allowedRoles.includes(userRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
        }

        // Create and sign JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        const signedToken = await new SignJWT({
            email: user.email || email,
            user,
            // Only middleware authorization data belongs in this size-limited cookie.
            // Full settings come from the authenticated context endpoint.
            settings: {
                allowScientistToRegisterClient: settings?.allowScientistToRegisterClient,
            },
            tenantId,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('12h')
            .sign(secret);

        await jwtVerify(signedToken, secret);
        if (new TextEncoder().encode(`PLS-SESSION=${signedToken}`).length > 3800) {
            throw new Error('The authentication session exceeds the supported cookie size');
        }
        const effectiveSessionExpiryTime = sessionExpiryTime || Date.now() + (12 * 60 * 60 * 1000);
        const maxAge = Math.max(1, Math.floor((effectiveSessionExpiryTime - Date.now()) / 1000));
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


        cookies().set("loginsessionId", loginsessionId || '', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge
        })

        return NextResponse.json({
            status: true,
            role: userRole,
            tenantId,
            message: 'Authentication successful'
        });

    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json({
            error: 'Authentication failed'
        }, { status: 500 });
    }
}
