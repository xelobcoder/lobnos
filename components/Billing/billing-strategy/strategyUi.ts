export type Mode = 'absolute' | 'percentage';
export type Pricing = 'discount' | 'surcharge';
export interface StrategyTest {
    testid: number; name: string; originalPrice: number; actualPrice: number;
    concessionMode: Mode; pricingType: Pricing; concessionValue: number; discountedValue: number;
}
export interface StrategyRecord {
    strategyid: number; name: string; description?: string | null;
    concessionMode: Mode; price_type: Pricing; concessionValue: number | string;
    allconcessionApplied?: number | boolean; allConcessionApplied?: number | boolean;
    isNHIS?: number | boolean; is_expired?: number | boolean;
    valid_from?: string | null; valid_until?: string | null;
    applicableTest?: StrategyTest[];
    applicableEntities?: { id: number; entity_type: string; name?: string; insuranceName?: string }[];
}
export const strategyRoot = '/billing/billing-strategy';
export const flag = (value: unknown) => value === true || value === 1 || value === '1';
export const allTests = (row: StrategyRecord) => flag(row.allconcessionApplied ?? row.allConcessionApplied);
export function statusOf(row: StrategyRecord, now = Date.now()) {
    if (flag(row.is_expired) || row.valid_until && new Date(row.valid_until).getTime() < now) return 'Expired';
    if (row.valid_from && new Date(row.valid_from).getTime() > now) return 'Scheduled';
    return 'Active';
}
export function dateLabel(value?: string | null) {
    if (!value) return 'No limit';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
// Same adjustment and rounding as the existing billing strategy model.
export function finalPrice(original: number, mode: Mode, type: Pricing, value: number) {
    const adjustment = Math.max(0, mode === 'absolute' ? value : original * value / 100);
    const result = type === 'discount' ? original - adjustment : original + adjustment;
    return Number((result < 0 ? (type === 'discount' ? original : 0) : result).toFixed(2));
}
export function priceTest(test: StrategyTest): StrategyTest {
    return { ...test, concessionValue: Number(test.concessionValue), originalPrice: Number(test.originalPrice), actualPrice: Number(test.actualPrice), discountedValue: finalPrice(Number(test.originalPrice), test.concessionMode, test.pricingType, Number(test.concessionValue)) };
}
export function filterStrategies(rows: StrategyRecord[], query: string, scheme: string, scope: string, status: string) {
    const term = query.trim().toLocaleLowerCase();
    return rows.filter(row => (!term || `${row.strategyid} ${row.name} ${row.description || ''}`.toLocaleLowerCase().includes(term)) &&
        (scheme === 'all' || flag(row.isNHIS) === (scheme === 'nhis')) &&
        (scope === 'all' || allTests(row) === (scope === 'all-tests')) &&
        (status === 'all' || statusOf(row) === status));
}
