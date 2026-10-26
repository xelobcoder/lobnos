import { NextRequest } from 'next/server';
import { getRequestContext } from '../../../../components/serverActions/requestHeaders';
import { getBackendAuthorization } from '../../../../lib/serverBackendAccess';

export async function GET(request: NextRequest) {
     try {
          const cookieHeader = request.headers.get('cookie');
          let sessionCookie = '';
          if (cookieHeader) {
               const cookies = cookieHeader.split(';').map(c => c.trim());
               const found = cookies.find(c => c.startsWith('pls-prime-tenant-session='));
               if (found) sessionCookie = found.split('=')[1];
          }

          const context = await getRequestContext();
          if (!context || !context['PLS_PRIME_TENANT_SESSION'] || !context['PLS_SESSION'] || !context.tenantId) {
               return new Response(
                    JSON.stringify({ error: 'Session not found', redirect: '/authentications/login' }),
                    {
                         status: 401,
                         headers: { 'Content-Type': 'application/json' },
                    }
               );
          }


          const { PLS_PRIME_TENANT_SESSION, PLS_SESSION } = context;

          const url = new URL(`/api/v1/prime/validate-token`, process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL);
          url.searchParams.set('tenantId', String(context.tenantId));
          const authorization = getBackendAuthorization();
          const response = await fetch(url.toString(), {
               headers: {
                    'Cookie': `pls-prime-tenant-session=${sessionCookie}`,
                    ...(authorization ? { Authorization: authorization } : {}),
                    'Content-Type': 'application/json',
                    'cache': 'no-cache,must-revalidate,no-store,max-age=60,s-maxage=0',
                    "pls-prime-tenant-session": PLS_PRIME_TENANT_SESSION,
                    "pls-session": PLS_SESSION
               },
               cache: 'no-store',
               credentials: 'include',
          });

          const data = await response.json()
          const { message, statusCode, status } = data;
          if (data.code === 'SESSION_ROLE_CHANGED') return Response.json({error:data.message,code:data.code},{status:409});
          if (response.status >= 500) return Response.json({ error: 'The session service is temporarily unavailable. Please try again.' }, { status: 502 });
          if (status != true) {
               const denied = response.status === 401 || response.status === 403 || statusCode === 401 || statusCode === 403 || data.isExpired === true;
               return new Response(
                    JSON.stringify({ error: message || 'Unable to validate the session.', ...(denied ? { redirect: '/authentications/login' } : {}) }),
                    {
                         status: denied ? 401 : 502,
                         headers: { 'Content-Type': 'application/json' },
                    }
               );
          }

          if (!(data.user?.user ?? data.user)?.role) return Response.json({ error: 'The session service returned incomplete account details. Please try again.' }, { status: 502 });


          return new Response(JSON.stringify({ ...data, tenantId: context.tenantId }), {
               status: 200,
               headers: { 'Content-Type': 'application/json' },
          });
     } catch (error) {
          console.error('Token validation error:', error);
          return new Response(
               JSON.stringify({ error: 'Token validation failed' }), {
               status: 500,
               headers: { 'Content-Type': 'application/json' },
          });
     }
}
