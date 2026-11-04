import 'server-only';
import {getServerRequestContext} from './serverRequestContext';
import {getBackendAuthorization} from './serverBackendAccess';
import {usesTenantQuery} from './apiBaseUrl';

export function backendTarget(endpoint: string, base: string) {
    const root = new URL(base.endsWith('/') ? base : base + '/');
    const relative = endpoint.replace(/^\/+/, '');
    const path = relative.split(/[?#]/)[0];
    let decoded = path;
    for (let pass = 0; pass < 4; pass++) {
        if (/(^|[\/\\])\.{1,2}([\/\\]|$)/.test(decoded) || decoded.includes('\\') || /[\x00-\x1f]/.test(decoded)) throw new Error('Invalid API path');
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
    }
    const target = new URL(relative, root);
    if (target.origin !== root.origin || !target.pathname.startsWith(root.pathname) || target.hash) throw new Error('Invalid API path');
    if (process.env.PLS_ENCRYPTION_REQUIRED === 'true' || process.env.HTTPS_REQUIRED === 'true') {
        const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname);
        const localHttpAllowed = process.env.HTTPS_ALLOW_LOOPBACK_HTTP === 'true' && loopback;
        if (target.protocol !== 'https:' && !(target.protocol === 'http:' && localHttpAllowed)) {
            throw new Error('The configured backend requires HTTPS');
        }
    }
    return target;
}

export async function serverBackendRequest(endpoint: string, options: RequestInit = {}, publicRequest = false, requestedTenantId?: number, baseOverride?: string) {
    const base = baseOverride ?? (process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL);
    if (!base) throw new Error('Backend URL is not configured');
    const target = backendTarget(endpoint, base);
    let credentialPath = target.pathname;
    for (let pass = 0; pass < 4; pass++) {
        const decoded = decodeURIComponent(credentialPath);
        if (decoded === credentialPath) break;
        credentialPath = decoded;
    }
    credentialPath = credentialPath.toLowerCase().split('/').filter(Boolean).join('/');
    if (['prime/refresh-role-session','prime/switch-role'].some(path => credentialPath === path || credentialPath.endsWith('/' + path))) {
        throw new Error('Use the dedicated authenticated role-session endpoint');
    }
    const context = publicRequest ? null : await getServerRequestContext();
    const authenticated = Boolean(context?.tenantId && context.PLS_SESSION && context.PLS_PRIME_TENANT_SESSION);
    const tenantId = context?.tenantId ?? requestedTenantId;
    if (authenticated && usesTenantQuery(endpoint)) target.searchParams.set('tenantId', String(tenantId));
    else if (publicRequest && Number.isSafeInteger(tenantId) && Number(tenantId) > 0 && usesTenantQuery(endpoint)) target.searchParams.set('tenantId', String(tenantId));
    const headers = new Headers(options.headers);
    for (const name of ['authorization', 'cookie', 'pls-session', 'pls-prime-tenant-session', 'loginsessionid', 'host', 'connection', 'content-length', 'transfer-encoding']) headers.delete(name);
    const authorization = getBackendAuthorization();
    if (authorization) headers.set('Authorization', authorization);
    if (authenticated && context) {
        headers.set('pls-session', context.PLS_SESSION);
        headers.set('pls-prime-tenant-session', context.PLS_PRIME_TENANT_SESSION);
        if (context.loginsessionId) headers.set('loginsessionId', context.loginsessionId);
    }
    return fetch(target, {...options, headers, cache: 'no-store', redirect: 'manual', signal: options.signal ?? AbortSignal.timeout(120000)});
}
