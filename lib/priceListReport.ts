import type { ReportPdfSpec } from '../components/reports/reportPdf';

export function priceListReport(items: Array<{ testid?: number | string; name?: string; discountedValue?: number | string | null }>): ReportPdfSpec {
    return {
        title: 'Price List',
        subtitle: 'Laboratory tests and services',
        notes: [`${items.length} tests and services. Currency: GHS.`, 'Prices are subject to change.'],
        tables: [{
            head: ['#', 'Test ID', 'Test / Service Name', 'Price (GHS)'],
            body: items.map((item, index) => {
                const value = item.discountedValue;
                const price = value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value))
                    ? Number(value).toFixed(2) : 'N/A';
                return [String(index + 1), String(item.testid ?? ''), item.name || '', price];
            }),
        }],
    };
}
