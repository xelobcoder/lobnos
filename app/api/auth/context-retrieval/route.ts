import { NextRequest } from 'next/server';
import { getRequestContext } from '../../../../components/serverActions/requestHeaders';

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
          if (!context || !context['PLS_PRIME_TENANT_SESSION'] || !context['PLS_SESSION']) {
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
          url.searchParams.append('tenantId', process.env.TENANTID || '');
          const response = await fetch(url.toString(), {
               headers: {
                    'Cookie': `pls-prime-tenant-session=${sessionCookie}`,
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'cache': 'no-cache,must-revalidate,no-store,max-age=60,s-maxage=0',
                    "pls-prime-tenant-session": PLS_PRIME_TENANT_SESSION,
                    "pls-session": PLS_SESSION
               },
               cache: 'no-cache',
               credentials: 'include',
          });

          const data = await response.json();

          const { message, statusCode, status } = data;
          if (status != true) {
               return new Response(
                    JSON.stringify({ error: message, redirect: '/authentications/login' }),
                    {
                         status: 401,
                         headers: { 'Content-Type': 'application/json' },
                    }
               );
          }
          return new Response(JSON.stringify(data), {
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
