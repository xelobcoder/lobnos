export type BillingLayout = 'multi-compact' | 'multi-primary-two';
export const resolveBillingLayout = (value: unknown): BillingLayout => value === 'multi-primary-two' ? 'multi-primary-two' : 'multi-compact';
export function billingLayoutUrl(pathname: string, query: string, layout: BillingLayout): string {
    const segment = layout === 'multi-primary-two' ? 'multi-layout-two' : 'multi';
    const path = pathname.replace(/\/(?:multi|multi-layout-two)(?=\/|$)/, '/' + segment);
    return path + (query ? '?' + query.replace(/^\?/, '') : '');
}
