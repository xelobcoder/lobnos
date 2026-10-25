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
            nhisMembershipId: data.nhismembershipid ? Number(data.nhismembershipid) : undefined,
            claimCheckCode: data.claimscheckcode ? Number(data.claimscheckcode) : undefined,
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

export const catalogueKey = (data: MultiBillingData) => JSON.stringify([data.patientid,data.branchid,data.billingSource,data.entityId,data.entitytype,Boolean(data.isPackageUsed),data.packageid,Boolean(data.includeServices),data.useSpecialCode?data.specialCode:'',data.nhismembershipid,data.claimscheckcode]);
