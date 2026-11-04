/** Editor-local guard; the server remains authoritative across tabs and devices.
 * Keep the operation ID after an uncertain response. Never persist clinical payloads. */
export function createResultSaveSession(newId: () => string = () => {
    // getRandomValues is also available on supported HTTP intranet deployments.
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}) {
    let inFlight = false;
    let lastPayload = '';
    let requestId = '';
    return {
        start() {
            if (inFlight) return false;
            inFlight = true;
            return true;
        },
        identify<T extends Record<string, unknown>>(payload: T): T & { request_id: string } {
            // A re-entered PIN is authorization material, not a new clinical operation.
            const { pin: _pin, request_id: _requestId, ...operation } = payload;
            const signature = JSON.stringify(operation);
            if (signature !== lastPayload || !requestId) {
                lastPayload = signature;
                requestId = newId();
            }
            return { ...payload, request_id: requestId };
        },
        finish() { inFlight = false; },
    };
}
