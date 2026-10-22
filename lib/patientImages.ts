import { buildApiUrl } from './apiBaseUrl';
import { getRequestContext } from '../components/serverActions/requestHeaders';

export const MAX_PATIENT_IMAGE_BYTES = 5 * 1024 * 1024;
const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];

export function validatePatientImage(file: Blob): void {
    if (!imageTypes.includes(file.type)) throw new Error('Choose a JPEG, PNG or GIF patient photo.');
    if (!file.size || file.size > MAX_PATIENT_IMAGE_BYTES) throw new Error('Patient photos must be 5 MB or smaller and cannot be empty.');
}

async function requestScope(patientId: number) {
    if (!Number.isSafeInteger(patientId) || patientId <= 0) throw new Error('A valid patient record is required.');
    const context = await getRequestContext();
    if (!context?.PLS_SESSION || !context?.PLS_PRIME_TENANT_SESSION ||
        !Number.isSafeInteger(context.tenantId) || Number(context.tenantId) <= 0) {
        throw new Error('Your staff session is unavailable. Sign in again to access patient photos.');
    }
    const headers = {
        'pls-prime-tenant-session': context.PLS_PRIME_TENANT_SESSION,
        'pls-session': context.PLS_SESSION,
        loginsessionId: context.loginsessionId || '',
    };
    return {
        url(endpoint: string) {
            const url = new URL(buildApiUrl(endpoint));
            url.searchParams.set('tenantId', String(context.tenantId));
            url.searchParams.set('patientid', String(patientId));
            return url.toString();
        },
        options: { headers, cache: 'no-store' as RequestCache, credentials: 'include' as RequestCredentials },
    };
}

async function imageResponse(response: Response) {
    const data = await response.json();
    if (!response.ok || !['success', true].includes(data?.status)) {
        throw new Error(data?.message || data?.error || 'Unable to save or load the patient photo.');
    }
    return data;
}

function filename(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= 255 && !/[\\/\x00]/.test(value) && !['.', '..'].includes(value);
}

export async function loadPatientImage(patientId: number, { signal }: { signal?: AbortSignal } = {}): Promise<{ imagePath: string; blob: Blob } | null> {
    const scope = await requestScope(patientId);
    const metadata = await imageResponse(await fetch(scope.url('patients/images'), { ...scope.options, signal }));
    if (metadata.imagePath === null) return null;
    if (!filename(metadata.imagePath)) throw new Error('The saved patient photo reference is invalid.');
    const response = await fetch(scope.url(`patient/images/${encodeURIComponent(metadata.imagePath)}`), { ...scope.options, signal });
    if (!response.ok) throw new Error('The saved patient photo could not be loaded. Please try again.');
    const blob = await response.blob();
    validatePatientImage(blob);
    return { imagePath: metadata.imagePath, blob };
}

export async function uploadPatientImage(patientId: number, file: Blob): Promise<string> {
    validatePatientImage(file);
    const scope = await requestScope(patientId);
    const body = new FormData();
    body.append('file', file, 'patient-photo');
    const endpoint = scope.url('storage/prime/uploads');
    const url = new URL(endpoint);
    url.searchParams.set('category', 'patients');
    const data = await imageResponse(await fetch(url.toString(), { ...scope.options, method: 'POST', body }));
    if (!filename(data.imagePath)) throw new Error('The server did not confirm a saved patient photo.');
    return data.imagePath;
}
