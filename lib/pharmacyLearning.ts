import type { Section } from './pharmacyAccounting';
import { pharmacyPageGuides, pharmacyWorkflowGuides, resolvePharmacyGuideSlug, type PharmacyPageGuide } from './pharmacyManual';

export const learningCategories = [
  ['getting-started', 'Start, shifts & setup'], ['selling', 'Sales & customer service'],
  ['stock', 'Medicines & stock'], ['purchasing', 'Purchasing & suppliers'],
  ['accounting', 'Money tasks & accounting pages'], ['reports', 'Reports & checking figures'],
] as const;
export interface LearningArticle {
  slug: string; category: PharmacyPageGuide['category']; title: string; route: string;
  what: string; steps: string[]; after: string; mistakes: string[]; related: string[];
  manual: PharmacyPageGuide;
}
export const learningArticles: LearningArticle[] = [...pharmacyPageGuides, ...pharmacyWorkflowGuides].map(manual => ({
  slug: manual.slug, category: manual.category, title: manual.title, route: manual.taskRoute || manual.route,
  what: manual.purpose, steps: manual.operations.flatMap(operation => operation.steps),
  after: manual.after, mistakes: manual.recovery,
  related: manual.next.map(resolvePharmacyGuideSlug), manual,
}));
export const accountingArticle: Record<Section, string> = {
  '': 'pharmacy-finances', 'chart-of-accounts': 'money-categories', 'general-ledger': 'accounting-transactions',
  journals: 'journal-entries', receivables: 'customer-balances', payables: 'supplier-balances',
  expenses: 'record-expense', revenue: 'revenue-report', cogs: 'cost-of-sales',
  'cash-bank': 'money-in-out', reconciliation: 'bank-reconciliation', suppliers: 'supplier-reports',
  inventory: 'stock-value', statements: 'income-statement', 'trial-balance': 'account-balance-check',
  tax: 'tax-rules', periods: 'financial-periods', audit: 'audit-trail', settings: 'shared-records',
};
export const articleHref = (slug: string) => `/pharmacy/guide/${resolvePharmacyGuideSlug(slug)}`;
export { resolvePharmacyGuideSlug };

export const pharmacyGuideVisuals: Record<string, { file: string; alt: string; caption: string }> = {
  'approve-request': { file: 'purchase-request.png', alt: 'Actual purchase-request review with numbered refresh, request, decision and reason controls.', caption: '1 Refresh requests; 2 Review request; 3 Decision; 4 Reason for decision. Approval is separate from receiving stock.' },
  'record-expense': { file: 'expense-draft.png', alt: 'Actual expense draft form with description, amount, supplier and save controls highlighted.', caption: '1 Description; 2 Amount; 3 Supplier; 4 Save expense draft. Complete the other required account and date fields before saving.' },
  'supplier-balances': { file: 'supplier-settlement.png', alt: 'Actual Payables settlement view with its tab, financial date, description and draft save control numbered.', caption: '1 Settlements; 2 Settlement financial date; 3 Settlement description; 4 Save draft allocated settlement. Select each original bill and actual allocation amount before saving.' },
  'close-day': { file: 'cash-day.png', alt: 'Actual cash and day-closing overview with page heading, daily task tab and review-before-closing action numbered.', caption: '1 Cash & day closing; 2 Today & next steps; 3 Review before closing. Review handovers before the actual close action.' },
};

export const pharmacyGlossary = [
  ['Outstanding', 'The amount still unpaid on the original invoice or bill. Check it after a collection or payment.'],
  ['Allocation', 'The explicit part of a payment or credit applied to a particular original bill.'],
  ['Debit / credit', 'The two sides of an accounting entry. They do not universally mean cash received and cash paid.'],
  ['General ledger', 'The posted accounting lines behind balances; open the source journal to investigate a figure.'],
  ['Cost of sales', 'The stock cost of the medicines actually sold, not the selling price or all purchases.'],
  ['Reconciliation', 'Comparing original records with independent evidence, such as a real bank statement.'],
  ['Facility accounting link', 'Optional configured posting from identifiable Pharmacy records to facility books; not a separate everyday Pharmacy page.'],
] as const;
