export function getBackendAuthorization(): string | undefined {
	const token = process.env.PLS_BACKEND_ACCESS_TOKEN?.trim();
	if (!token) return undefined;

	return `Bearer ${token}`;
}

export function assertBackendTransport(target: URL): void {
    if (process.env.PLS_ENCRYPTION_REQUIRED === 'true' || process.env.HTTPS_REQUIRED === 'true') {
        if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('TLS certificate verification must remain enabled');
        const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname);
        const localHttpAllowed = process.env.HTTPS_ALLOW_LOOPBACK_HTTP === 'true' && loopback;
        if (target.protocol !== 'https:' && !(target.protocol === 'http:' && localHttpAllowed)) {
            throw new Error('The configured backend requires HTTPS');
        }
    }
}
