import type { MultiBillingData } from '../../../lib/Multi/MultiTypes';
export type SelectionKind = 'test' | 'service';
export type SelectedItem = { kind: SelectionKind; id: number; row: any };
export type ModernDraft = { items: SelectedItem[]; reviewedKey?: string; reviewedAt?: string };
export const itemId = (kind: SelectionKind, row: any) => Number(kind === 'test' ? row.testid || row.id : row.keyid || row.id);
export const itemName = (item: SelectedItem) => String(item.row.name || item.row.serviceName || 'Unnamed item');
export const itemKey = (item: Pick<SelectedItem, 'kind' | 'id'>) => item.kind + ':' + item.id;
export function draftFromBilling(data: MultiBillingData): ModernDraft {
    return { items: [...(data.cart || []).map(row => ({ kind: 'test' as const, id: itemId('test', row), row })), ...(data.servicesProvided || []).map(row => ({ kind: 'service' as const, id: itemId('service', row), row }))] };
}
export function previewRequest(data: MultiBillingData, draft: ModernDraft) {
    return {
        context: {
            patientId: Number(data.patientid || 0), billingId: data.billingid ? Number(data.billingid) : undefined,
            billingSource: Number(data.billingSource), entityId: data.entityId ? Number(data.entityId) : undefined,
            quote: Boolean(data.ispricingcheckout), packageId: data.isPackageUsed ? Number(data.packageid) || undefined : undefined,
            referralCode: data.useSpecialCode ? String(data.specialCode || '') : undefined,
            promoCode: data.isPromo ? String(data.promoCode || '') : undefined,
            nhisMembershipId: data.nhismembershipid ? String(data.nhismembershipid).trim() : undefined,
            claimCheckCode: data.claimscheckcode ? String(data.claimscheckcode).trim() : undefined,
        },
        items: draft.items.map(({ kind, id, row }) => ({
            kind, id,
            ...(row.userAdjustmentType ? { adjustment: { type: row.userAdjustmentType, value: Number(row.userAdjustedValue || 0) } } : {}),
            prioritised: Boolean(row.prioritised),
            ...(kind === 'test' && row.organization?.outsourceid ? { outsourceId: Number(row.organization.outsourceid) } : kind === 'test' && row.outsourceid ? { outsourceId: Number(row.outsourceid) } : {}),
        })),
    };
}
export const reviewKey = (data: MultiBillingData, draft: ModernDraft) => JSON.stringify(previewRequest(data, draft));
export function selectionIssue(data: MultiBillingData, draft: ModernDraft): string | null {
    if (!draft.items.length) return 'Select at least one test or service to continue.';
    if (data.isPackageUsed && !data.packageid) return 'Select a package in billing setup.';
    if (new Set(draft.items.map(itemKey)).size !== draft.items.length) return 'Remove duplicate selections before reviewing.';
    return null;
}
export function mergePreview(data: MultiBillingData, priced: any): MultiBillingData {
    if (!Array.isArray(priced?.cart) || !Array.isArray(priced?.servicesProvided) || !Number.isFinite(Number(priced.amountPayable))) throw new Error('The billing preview is incomplete. Please retry.');
    return { ...data, ...priced, testList: data.testList, servicesList: data.servicesList,
        cart: priced.cart, servicesProvided: priced.servicesProvided, payments: [], paid: 0,
        balance: Number(priced.amountPayable), showsummary: true, allowAdvancePayment: true,
        promoDetails: priced.promoDetails || {},
    };
}
export function filterCatalogue(items: SelectedItem[], query: string, kind: 'all' | SelectionKind) {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter(item => (kind === 'all' || item.kind === kind) && terms.every(term => (itemName(item) + ' ' + (item.row.code || item.row.testCode || '')).toLowerCase().includes(term)));
}

// Match catalogue identity by meaning, not JSON number/string representation.
export const catalogueKey = (data: MultiBillingData) => {
    const id = (value: unknown) => Number(value) || null;
    const source = id(data.billingSource) || 1;
    const type = ({1:'general',2:'organization',3:'insurance',4:'nhis',6:'clinician'} as Record<number,string>)[source] || String(data.entitytype || '').toLowerCase();
    return JSON.stringify([id(data.patientid),id(data.branchid),source,
        source === 1 || source === 4 ? null : id(data.entityId),type,
        Boolean(data.isPackageUsed),data.isPackageUsed ? id(data.packageid) : null,
        Boolean(data.includeServices),data.useSpecialCode ? String(data.specialCode || '').trim() : '',
        source === 4 ? String(data.nhismembershipid || '').trim() : null,source === 4 ? String(data.claimscheckcode || '').trim() : null,
        id(data.billingid),Boolean(data.ispricingcheckout)]);
};
export function payerSetupIssue(data: MultiBillingData): string | null {
    if (data.showRelatedBilling && !data.billingIdVerified) return 'Verify the related bill before loading the catalogue.';
    if (data.isPackageUsed && !(Number(data.packageid) > 0)) return 'Select a package before loading its tests.';
    if (data.useSpecialCode) return String(data.specialCode || '').trim().length > 3 ? null : 'Enter a valid referral code before loading the catalogue.';
    const source = Number(data.billingSource || 1);
    if (source === 4) return [data.nhismembershipid,data.claimscheckcode].every(value=>/^\d{1,64}$/.test(String(value || '').trim()) && /[1-9]/.test(String(value))) ? null : 'Enter the NHIS membership number and claim check code.';
    if ([2,3,6].includes(source) && !(Number(data.entityId) > 0)) return 'Select the paying '+({2:'organization',3:'insurance provider',6:'clinician'} as Record<number,string>)[source]+'.';
    if (![1,2,3,4,6].includes(source)) return 'Choose a supported billing source.';
    return null;
}
