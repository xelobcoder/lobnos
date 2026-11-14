"use server";
import {serverBackendRequest} from '../../lib/serverBackendRequest';

export async function requestBackendJson(endpoint: string, method = 'GET', body?: unknown, publicRequest = false, requestedTenantId?: number): Promise<any> {
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].includes(method.toUpperCase())) throw new Error('Unsupported API method');
    try {
        const response = await serverBackendRequest(endpoint, {
            method: method.toUpperCase(),
            headers: {'Content-Type': 'application/json'},
            body: ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : JSON.stringify(body),
        }, publicRequest, requestedTenantId);
        if (response.status === 204 || method.toUpperCase() === 'HEAD') return {status: response.ok};
        const data = await response.json();
        return !response.ok && data && typeof data === 'object' ? {...data,statusCode:data.statusCode??response.status} : data;
    } catch (error: any) {
        // Keep the client message generic, but leave a server-side breadcrumb: the endpoint path
        // (never the query string, which can contain patient search terms) and the failure reason.
        console.error('[backend-request] failed', {
            method: method.toUpperCase(),
            endpoint: String(endpoint).split('?')[0],
            reason: error?.message || String(error),
        });
        return {status:false,success:false,statusCode:503,code:'UPSTREAM_UNAVAILABLE',message:'The server response could not be confirmed. Retry the original operation.',error:{code:'UPSTREAM_UNAVAILABLE',message:'The server response could not be confirmed. Retry the original operation.'}};
    }
}
