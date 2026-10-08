'use server';
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getRequestContext() {
     const headersCookies = cookies();
     const PLS_SESSION = headersCookies.get('PLS-SESSION')?.value || '';
     const PLS_PRIME_TENANT_SESSION = headersCookies.get('pls-prime-tenant-session')?.value || '';
     const loginsessionId = headersCookies.get('loginsessionId')?.value || '';
     let tenantId: number | null = null;

     if (PLS_SESSION) {
          try {
               const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
               const { payload } = await jwtVerify(PLS_SESSION, secret);
               const sessionTenantId = Number(payload.tenantId);
               if (Number.isSafeInteger(sessionTenantId) && sessionTenantId > 0) {
                    tenantId = sessionTenantId;
               } else if (payload.tenantId === undefined) {
                    const configuredTenantId = Number(process.env.TENANTID);
                    tenantId = Number.isSafeInteger(configuredTenantId) && configuredTenantId > 0
                         ? configuredTenantId
                         : null;
               }
          } catch {
               tenantId = null;
          }
     }

     return {
          PLS_SESSION,
          PLS_PRIME_TENANT_SESSION,
          loginsessionId,
          tenantId,
     };
}
