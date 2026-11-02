import type { RecordData } from './pharmacyAccounting';

/** Required categories and controls mirror the final accounting service contract.
 * These constraints are displayed/validated, never used to populate mappings.
 */
export const requiredMappingCategories = [
  'sales','inventory','cost_of_sales','operating_expenses','opening_equity','payable','receivable',
  'cash','bank','mobile_money','inventory_adjustments','quarantine_inventory','stock_in_transit',
  'inventory_in_transit','supplier_returns_pending','interbranch_receivable','interbranch_payable',
] as const;
const canonicalControls: Record<string,string> = {
  receivable:'acc-1002',payable:'acc-2000',supplier_payable:'acc-2000',inventory:'acc-1003',
  cost_of_sales:'acc-5000',cash:'acc-1000',bank:'acc-1001',mobile_money:'acc-1001',
};
export function canonicalControl(local: string, collectionAccounts: RecordData[] = []): string | undefined {
  const category=local.startsWith('receivable:')?'receivable':local.startsWith('payable:')?'payable':
    local.startsWith('collection:')?String(collectionAccounts.find(a=>String(a.id)===local.slice(11))?.account_type||''):local;
  return canonicalControls[category];
}
export function configurationIssues(enabled: boolean, mappings: Record<string,string>, collectionAccounts: RecordData[] = []): string[] {
  if(!enabled) return []; // The backend permits incomplete disabled draft configuration.
  const missing=requiredMappingCategories.filter(category=>!mappings[category]);
  const issues=missing.length?[`Enabling requires explicit mappings for: ${missing.join(', ')}.`]:[];
  for(const [local,code] of Object.entries(mappings)){
    if(!code)continue;
    if(local.startsWith('collection:')&&!collectionAccounts.some(a=>String(a.id)===local.slice(11))) {
      issues.push(`Collection mapping ${local} cannot be verified against this branch's collection accounts.`);
      continue;
    }
    const control=canonicalControl(local,collectionAccounts);
    if(control&&code!==control)issues.push(`Mapping ${local} must explicitly use ${control}. Custom core controls require a reviewed reporting-classification migration.`);
  }
  return issues;
}
