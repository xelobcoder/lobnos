export async function establishPatientSession(backend: any, request: typeof fetch = fetch) {
    if (!backend?.status || backend.status === 'error' || backend.status === 'false') {
        throw new Error(backend?.error || backend?.message || 'Sign in failed. Please try again.');
    }
    const tenantId = Number(backend.tenantId ?? backend.user?.tenantId);
    const accessToken = backend.accessToken || backend.token;
    if (!accessToken || !Number.isSafeInteger(tenantId) || tenantId <= 0) {
        throw new Error('The server did not return a valid patient session.');
    }
    const response = await request('/api/auth/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backend.status, accessToken, tenantId, loginsessionId: backend.loginsessionId, sessionExpiryTime: backend.sessionExpiryTime }),
    });
    const session = await response.json();
    if (!response.ok || !session.status || session.role !== 'patient') {
        throw new Error(session.error || 'A patient account is required.');
    }
    const contextResponse = await request('/api/auth/context-retrieval', { credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const context = await contextResponse.json();
    const user = context.user?.user || context.user;
    if (!contextResponse.ok || user?.role !== 'patient' || Number(context.tenantId) !== tenantId) {
        throw new Error('Your browser did not retain the patient session. Please allow cookies and try again.');
    }
    return { ...context, user };
}
