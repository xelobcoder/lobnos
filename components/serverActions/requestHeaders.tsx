'use server';
import { cookies } from "next/headers";

export async function getRequestContext() {
     const headersCookies = cookies();
     const PLS_SESSION = headersCookies.get('PLS-SESSION')?.value || '';
     const PLS_PRIME_TENANT_SESSION = headersCookies.get('pls-prime-tenant-session')?.value || '';
     const loginsessionId = headersCookies.get('loginsessionId')?.value || '';
     return {
          PLS_SESSION,
          PLS_PRIME_TENANT_SESSION
          , loginsessionId
     };
}
