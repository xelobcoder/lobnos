export function masterCatalogEndpoint(endpoint: string, pathname = typeof window === 'undefined' ? '' : window.location.pathname): string {
    if (!pathname.startsWith('/master-platform/test-catalog')) return endpoint;
    const resource = endpoint.replace(/^\/?api\/v1\//, '').replace(/^\//, '');
    if (resource.startsWith('platform/')) return endpoint;
    if (/^https?:/i.test(resource)) throw new Error('External requests are not supported in the master catalogue');
    return 'platform/facilities/catalog-api/' + resource;
}
