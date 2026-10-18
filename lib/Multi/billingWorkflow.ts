import { customFetch } from '../../components/Auth/customFetch';
import type { billingContextProps, MultiBillingData } from './MultiTypes';

export async function getFacilityBillingMode(): Promise<'simple' | 'advanced'> {
    const response = await customFetch('billing/strategies/mode-capability');
    if (response?.status !== 'success' || typeof response.hasActiveStrategies !== 'boolean') {
        throw new Error(response?.message || 'Unable to determine the facility billing configuration. Please retry.');
    }
    return response.hasActiveStrategies ? 'advanced' : 'simple';
}

export function generalBillingUrl(patientId: string, query: string): string {
    const params = new URLSearchParams(query);
    params.set('isOpenSideBarShow', 'false');
    return `/billing/patientid/${patientId}/multi/1?${params.toString()}`;
}

export function canPreloadGeneralBilling(context: billingContextProps): boolean {
    return context.categorytrackid === 1 && !context.suspendedDraftId &&
        !context.billingid && !context.isAdjustment && !context.specialcode &&
        !context.entityid;
}

export function billingInitUrl(data: MultiBillingData, includeServices: boolean, isPricingCheckout: boolean): string {
    const source = Number(data.billingSource);
    const params = new URLSearchParams({
        isPackageUsed: String(data.isPackageUsed),
        useServices: String(includeServices),
        includeServices: String(includeServices),
        packageid: String(data.packageid || ''),
        branchid: String(data.branchid || ''),
        patientId: String(data.patientid ?? ''),
        billingSource: String(source),
        ispricingcheckout: String(isPricingCheckout),
    });
    if (data.billingid) params.set('billingid', String(data.billingid));
    if (data.useSpecialCode && data.specialCode) {
        params.set('referalCode', data.specialCode);
    } else if (source === 4) {
        if (!data.nhismembershipid || !data.claimscheckcode) {
            throw new Error('Enter the NHIS membership ID and claims check code before loading prices.');
        }
        params.set('entityType', 'nhis');
        params.set('nhisMemberId', String(data.nhismembershipid));
        params.set('claimCheckCode', String(data.claimscheckcode));
    } else if (source === 1) {
        params.set('entityType', 'general');
    } else {
        if (![2, 3, 6].includes(source) || !data.entitytype || !data.entityId) {
            throw new Error('Select the billing entity before loading prices.');
        }
        params.set('entityType', data.entitytype);
        params.set('entityId', String(data.entityId));
    }
    return `billing/multi/init?${params.toString()}`;
}
