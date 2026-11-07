import { RiUserLine, RiMoneyDollarCircleLine, RiFileListLine, RiTimeLine, RiUserAddLine, RiCustomerService2Line, RiCalendarLine, RiShieldCheckLine } from '@remixicon/react';
import type { Link } from './types';
import { roleWorkspace, canAccessRolePage, canShowClinicalWorkspaceLink, navigationPath, NavigationSettings } from '../../../lib/roleNavigationPolicy';
import { roleAllowed, isSuperAdminRole } from '../../Auth/roles';
import { canAccessFacilityModule } from '../../../lib/facilityModuleAccess';
import { LaboratoryOperationsLinks } from './categories/LaboratoryOperationsLinks';
import { PhlebotomyLinks } from './categories/PhlebotomyLinks';
import { ImagingLinks } from './categories/imaginglinks';
import { InventoryLinks } from './categories/InventoryLinks';
import { AccountingLinks } from './categories/AccountingLinks';
import { ExpensesLinks } from './categories/ExpensesLinks';
import { PayrollLinks } from './categories/PayrollLinks';
import { CommissionLinks } from './categories/CommissionLinks';
import { PharmacyLinks } from './categories/PharmacyLinks';
const item = (title: string, link: string, icon = <RiFileListLine />): Link => ({ title, link, icon });
const withinWorkspace = (workspace: string, root: string) => workspace === root || workspace.startsWith(`${root}/`);
function isWorkspaceToolVisible(link: string, workspacePath: string) {
     if (!workspacePath) return true;
     const workspace = navigationPath(workspacePath), target = navigationPath(link);
     if (target === '/operations/laboratory/requisitions' || withinWorkspace(target, '/operations/laboratory/test-panels'))
          return withinWorkspace(workspace, '/operations/laboratory');
     if (target === '/operations/imaging/ultrasound/requisitions')
          return withinWorkspace(workspace, '/operations/imaging');
     return true;
}
export const CrmStaffLinks: Link[] = [
     item('CRM Learning Center', '/crm/guide'), item('Billing Learning Center', '/billing/guide'),
     item('CRM workspace', '/crm/overview', <RiCustomerService2Line />),
     { title: 'Patients & service', link: '', children: [item('Customers', '/crm/customers', <RiUserLine />), item('Patient registration', '/crm/registration', <RiUserAddLine />), item('Walk-in queue', '/operations/queue', <RiTimeLine />), item('Appointments', '/appointments', <RiCalendarLine />), item('Released results', '/crm/validated'), item('Result delivery', '/operations/laboratory/undelivered')] },
     { title: 'Billing requests', link: '', children: [item('Prepare billing', '/billing/patientid'), item('Entity order review', '/billing/entity-orders'), item('Suspended billing', '/billing/suspended-transactions'), item('Test price list', '/crm/pricelist'), item('View packages', '/billing/packages')] },
     { title: 'Patient follow-up', link: '', children: [item('Customer leads', '/crm/leads/list'), item('Lead follow-up', '/crm/leads/follow-up'), item('Upcoming birthdays', '/crm/birthdays/upcoming-birthday')] },
     { title: 'SMS', link: '', children: [item('SMS overview', '/communications/sms/dashboard'), item('Compose SMS', '/communications/sms/jobs'), item('SMS campaigns', '/communications/sms/jobs/list'), item('SMS templates', '/communications/sms/templates')] },
     item('Organizations', '/organization'), item('Referring practitioners', '/clinicians')
];
export const CashierLinks: Link[] = [item('Billing Learning Center', '/billing/guide'), item('Cash collection', '/billing/cash-collection', <RiMoneyDollarCircleLine />), item('Receipts & reprints', '/billing/receipts'), item('Cashier sales session', '/billing/billing-sessions/sales-session', <RiTimeLine />), item('Organization invoices', '/billing/organization-invoices'), item('Test price list', '/crm/pricelist'), item('View packages', '/billing/packages')];
export const MarketingStaffLinks: Link[] = [item('CRM Learning Center', '/crm/guide'), item('Referrer acquisition & follow-up', '/crm/acquisition', <RiCustomerService2Line />)];
export function roleSidebarSource(role: unknown, supplied: Link[]): Link[] {
     switch (roleWorkspace(role)) {
          case 'crm': return CrmStaffLinks; case 'cashier': return CashierLinks; case 'marketer': return MarketingStaffLinks;
          case 'doctor': case 'medicalofficer': case 'consultant': case 'pharmacydoctor': case 'pharmacynurse': return [item('Practitioner workspace', '/doctor'), item('Consultations', '/doctor/consultation'), item('My clinical access', '/doctor/permissions')];
          case 'nurse': case 'nursing': return [item('Operations Learning Center', '/operations/guide'), item('Patients & triage', '/doctor/consultation'), item('Vital signs', '/operations/laboratory/vitals/record-vital-sign')];
          case 'headoflaboratory': return [item('Operations Learning Center', '/operations/guide'), item('Laboratory requisitions', '/operations/laboratory/requisitions'), item('Manage test panels', '/operations/laboratory/test-panels/testlist')];
          case 'headofimaging': return [item('Operations Learning Center', '/operations/guide'), item('Imaging Operations', '/operations/imaging'), item('Imaging requisitions', '/operations/imaging/ultrasound/requisitions')];
          case 'scientist': return LaboratoryOperationsLinks; case 'phlebotomist': return PhlebotomyLinks; case 'sonographer': return ImagingLinks;
          case 'storekeeper': return InventoryLinks; case 'accountant': return [...AccountingLinks, item('Inventory Learning Center', '/inventory/guide'), { title: 'Collections', link: '', children: CashierLinks }, { title: 'Expenses', link: '', children: ExpensesLinks }, { title: 'Payroll', link: '', children: PayrollLinks }, { title: 'Commissions', link: '', children: CommissionLinks }];
          case 'pharmacymanager': case 'pharmacycashier': case 'pharmacystorekeeper': case 'pharmacyaccountant': case 'pharmacydispensaryofficer': case 'pharmacist': return PharmacyLinks;
          default: return supplied;
     }
}
export function filterRoleSidebar(items: Link[], role: unknown, settings: NavigationSettings & { moduleConfiguration?: unknown; smsActivated?: number | boolean | null } = {}, workspacePath = ''): Link[] {
     const admin = roleWorkspace(role) === 'admin', superAdmin = isSuperAdminRole(role);
     return items.filter(item => {
          if (item.roles?.length && item.roles.every(isSuperAdminRole) && !superAdmin) return false;
          return superAdmin || admin || !item.roles || roleAllowed(role, item.roles);
     }).map(item => ({
          ...item,
          title: item.link === '/operations/laboratory/test-panels/testlist'
               && settings.testPanelsView === true
               && settings.testPanelsManagement !== true
               ? 'View test panels'
               : item.link === '/operations/laboratory/test-panels/testlist'
                    && settings.testPanelsDelegation === true
                    && settings.testPanelsView !== true
                    ? 'Manage test-panel access'
               : item.title,
          children: item.children ? filterRoleSidebar(item.children, role, settings, workspacePath) : undefined
     })).filter(item => {
          if (item.link && !isWorkspaceToolVisible(item.link, workspacePath)) return false;
          if (item.link && (!canShowClinicalWorkspaceLink(workspacePath, item.link) || !canAccessRolePage(role, item.link, settings) || (!superAdmin && !canAccessFacilityModule(item.link, settings.moduleConfiguration, { smsActivated: settings.smsActivated })))) return false;
          if (item.children?.length) return true;
          return !!item.link;
     });
}

export function roleWorkspaceSidebar(role: unknown, supplied: Link[], settings: NavigationSettings & { moduleConfiguration?: unknown; smsActivated?: number | boolean | null } = {}, workspacePath = ''): Link[] {
     const base = roleSidebarSource(role, supplied);
     const contains = (items: Link[], path: string): boolean => items.some(link => link.link === path || !!link.children && contains(link.children, path));
     const extra = (settings.departmentStock || []).filter(department => ['laboratory', 'imaging'].includes(department)).map(department => item(department === 'laboratory' ? 'Laboratory supplies' : 'Imaging supplies', department === 'laboratory' ? '/operations/laboratory/requisitions' : '/operations/imaging/ultrasound/requisitions'));
     const panelPath = '/operations/laboratory/test-panels/testlist';
     if (settings.testPanelsView === true || settings.testPanelsManagement === true || settings.testPanelsDelegation === true) {
          const label = settings.testPanelsManagement === true ? 'Manage test panels'
               : settings.testPanelsView === true ? 'View test panels' : 'Manage test-panel access';
          extra.push(item(label, panelPath));
     }
     return filterRoleSidebar([...base, ...extra.filter(link => !contains(base, link.link))], role, settings, workspacePath);
}

export function roleSidebarQuickLinks(role: unknown, supplied: Link[], settings: NavigationSettings & { moduleConfiguration?: unknown; smsActivated?: number | boolean | null } = {}, workspacePath = '') {
     const hubs: Record<string, [string, string][]> = {
          accountant: [['Accounting', '/accounting'], ['Collections', '/billing/cash-collection'], ['Expenses', '/billing/expenses'], ['Payroll', '/human-resource/payroll'], ['Inventory valuation', '/accounting/inventory/valuation']],
          scientist: [['Laboratory workspace', '/operations/laboratory'], ['Workbench', '/operations/laboratory/workbench'], ['Manage test panels', '/operations/laboratory/test-panels/testlist'], ['Quality control', '/operations/laboratory/quality-control'], ['Patient registration', '/crm/registration'], ['Incident reporting', '/compliance/incident-reporting']],
          phlebotomist: [['Phlebotomy', '/operations/phelobotomy'], ['Pending samples', '/operations/phelobotomy/pending-samples-collection'], ['Sample validation', '/operations/laboratory/sample/validation'], ['Incident reporting', '/compliance/incident-reporting']],
          storekeeper: [['Inventory', '/inventory'], ['Inventory analytics', '/inventory/analytics']],
          pharmacymanager: [['Pharmacy', '/pharmacy'], ['Point of sale', '/pharmacy/sell'], ['Inventory', '/pharmacy/inventory'], ['Pharmacy Accounting', '/pharmacy/accounting'], ['Cash & Financial Days', '/pharmacy/finance'], ['Settings', '/pharmacy/settings'], ['Staff access', '/account/staff']],
          pharmacyaccountant: [['Pharmacy Accounting', '/pharmacy/accounting'], ['Cash & Financial Days', '/pharmacy/finance'], ['Cashier', '/pharmacy/cashier'], ['Counter invoices', '/pharmacy/counter'], ['NHIS claims', '/pharmacy/nhis'], ['Reports', '/pharmacy/analytics']],
          pharmacystorekeeper: [['Pharmacy inventory', '/pharmacy/inventory'], ['Stock control', '/pharmacy/stock-control'], ['Reports', '/pharmacy/analytics']],
          pharmacycashier: [['Point of sale', '/pharmacy/sell'], ['Cashier shift', '/pharmacy/cashier'], ['Counter invoices', '/pharmacy/counter'], ['Sales history', '/pharmacy/sales-history']],
          pharmacydispensaryofficer: [['Point of sale', '/pharmacy/sell'], ['Prescriptions', '/pharmacy/prescriptions'], ['Clinical review', '/pharmacy/clinical'], ['Counter invoices', '/pharmacy/counter']],
          pharmacist: [['Point of sale', '/pharmacy/sell'], ['Prescriptions', '/pharmacy/prescriptions'], ['Clinical review', '/pharmacy/clinical'], ['Sales history', '/pharmacy/sales-history']]
     };
     const panelPath = '/operations/laboratory/test-panels/testlist';
     const source = hubs[roleWorkspace(role)]?.map(([title, path]) => item(path === panelPath && settings.testPanelsView === true && settings.testPanelsManagement !== true ? 'View test panels' : title, path)) || roleSidebarSource(role, supplied);
     const links = filterRoleSidebar(source, role, settings, workspacePath), seen = new Set<string>();
     const result: { href: string; label: string; text: string; description: string; category: string; icon?: React.ReactNode }[] = [];
     const collect = (items: Link[], category: string) => { for (const item of items) { if (item.link && !seen.has(item.link)) { seen.add(item.link); result.push({ href: item.link, label: item.title, text: item.title, description: item.title, category, icon: item.icon }); } if (item.children) collect(item.children, item.title); } };
     collect(links, 'Your workspace'); return result;
}
