"use server";
import {getServerRequestContext} from '../../lib/serverRequestContext';

export async function getRequestContext() {
    const context = await getServerRequestContext();
    return {
        tenantId: context.tenantId,
        authenticated: Boolean(context.tenantId && context.PLS_SESSION && context.PLS_PRIME_TENANT_SESSION),
    };
}
