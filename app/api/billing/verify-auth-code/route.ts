import {assertBackendTransport} from '../../../../lib/serverBackendRequest';
import { NextRequest } from 'next/server';
import { getBackendAuthorization } from '../../../../lib/serverBackendAccess';

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const { authCode, billingId } = body;

          if (!authCode || !authCode.trim()) {
               return new Response(
                    JSON.stringify({
                         status: 'error',
                         valid: false,
                         message: 'Authorization code is required'
                    }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
               );
          }

          // Call backend to verify authorization code
          const url = new URL(
               `/api/v1/billing/verify-free-authorization-code`,
               process.env.NODE_ENV === 'development'
                    ? process.env.DEVELOPMENT_BASEURL
                    : process.env.PRODUCTION_BASEURL
          );

          url.searchParams.append('authCode', authCode.trim());
          if (billingId) {
               url.searchParams.append('billingId', billingId);
          }

          const authorization = getBackendAuthorization();
          assertBackendTransport(url);
          const response = await fetch(url.toString(), {
               method: 'POST',
               headers: {
                    ...(authorization ? { Authorization: authorization } : {}),
                    'Content-Type': 'application/json',
                    'cache': 'no-cache,must-revalidate,no-store,max-age=60,s-maxage=0'
               },
               cache: 'no-cache',
          });

          const data = await response.json();
          console.log('Backend auth code verification response:', data);

          // Check if backend validation was successful
          if (data.status === 'success' || data.valid === true) {
               return new Response(
                    JSON.stringify({
                         status: 'success',
                         valid: true,
                         message: 'Authorization code verified successfully'
                    }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
               );
          }

          return new Response(
               JSON.stringify({
                    status: 'error',
                    valid: false,
                    message: data.message || 'Invalid or expired authorization code'
               }),
               { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
     } catch (error) {
          console.error('Authorization code verification error:', error);
          return new Response(
               JSON.stringify({
                    status: 'error',
                    valid: false,
                    message: 'Error verifying authorization code'
               }),
               { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
     }
}
