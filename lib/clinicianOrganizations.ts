import { customFetch, customFetchMutation } from '../components/Auth/customFetch';

export interface ClinicianOrganization {
    id: number;
    name: string;
    /** The clinician's main organization from the clinician profile. */
    primary: boolean;
}

function organizationsFrom(response: any, fallback: string): ClinicianOrganization[] {
    if (response?.status !== 'success' || !Array.isArray(response?.result)) {
        throw new Error(response?.message || response?.error || fallback);
    }
    return response.result.map((row: any) => ({ id: Number(row.id), name: String(row.name ?? ''), primary: Boolean(row.primary) }));
}

/** Organizations a referring clinician works at (they may refer from several). */
export async function fetchClinicianOrganizations(clinicianId: number): Promise<ClinicianOrganization[]> {
    return organizationsFrom(await customFetch(`clinicians/${clinicianId}/organizations`), 'Could not load the clinician\'s organizations');
}

export async function linkClinicianOrganization(clinicianId: number, organizationId: number): Promise<ClinicianOrganization[]> {
    return organizationsFrom(
        await customFetchMutation(`clinicians/${clinicianId}/organizations`, 'POST', { organizationId }),
        'Could not link the organization to the clinician');
}

export async function unlinkClinicianOrganization(clinicianId: number, organizationId: number): Promise<ClinicianOrganization[]> {
    return organizationsFrom(
        await customFetchMutation(`clinicians/${clinicianId}/organizations/${organizationId}`, 'DELETE', undefined),
        'Could not remove the organization from the clinician');
}
