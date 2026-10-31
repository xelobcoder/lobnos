import {RiUserLine,RiMoneyDollarCircleLine,RiFileListLine,RiTimeLine,RiUserAddLine,RiCustomerService2Line,RiCalendarLine,RiShieldCheckLine} from '@remixicon/react';
import type {Link} from './types';
import {roleWorkspace,canAccessRolePage,NavigationSettings} from '../../../lib/roleNavigationPolicy';
import {roleAllowed,isSuperAdminRole} from '../../Auth/roles';
import {canAccessFacilityModule} from '../../../lib/facilityModuleAccess';
import {LaboratoryOperationsLinks} from './categories/LaboratoryOperationsLinks';
import {PhlebotomyLinks} from './categories/PhlebotomyLinks';
import {ImagingLinks} from './categories/imaginglinks';
import {InventoryLinks} from './categories/InventoryLinks';
import {AccountingLinks} from './categories/AccountingLinks';
import {ExpensesLinks} from './categories/ExpensesLinks';
import {PayrollLinks} from './categories/PayrollLinks';
import {PharmacyLinks} from './categories/PharmacyLinks';
const item=(title:string,link:string,icon=<RiFileListLine/>):Link=>({title,link,icon});
export const CrmStaffLinks:Link[]=[
 item('CRM workspace','/crm/overview',<RiCustomerService2Line/>),
 {title:'Patients & service',link:'',children:[item('Customers','/crm/customers',<RiUserLine/>),item('Patient registration','/crm/registration',<RiUserAddLine/>),item('Walk-in queue','/operations/queue',<RiTimeLine/>),item('Appointments','/appointments',<RiCalendarLine/>),item('Released results','/crm/validated'),item('Result delivery','/operations/laboratory/undelivered')]},
 {title:'Billing requests',link:'',children:[item('Prepare billing','/billing/patientid'),item('Entity order review','/billing/entity-orders'),item('Suspended billing','/billing/suspended-transactions'),item('Test price list','/crm/pricelist'),item('View packages','/billing/packages')]},
 {title:'Patient follow-up',link:'',children:[item('Customer leads','/crm/leads/list'),item('Lead follow-up','/crm/leads/follow-up'),item('Upcoming birthdays','/crm/birthdays/upcoming-birthday')]},
 {title:'SMS',link:'',children:[item('SMS overview','/communications/sms/dashboard'),item('Compose SMS','/communications/sms/jobs'),item('SMS campaigns','/communications/sms/jobs/list'),item('SMS templates','/communications/sms/templates')]},
 item('Organizations','/organization'),item('Referring practitioners','/clinicians')
];
export const CashierLinks:Link[]=[item('Cash collection','/billing/cash-collection',<RiMoneyDollarCircleLine/>),item('Receipts & reprints','/billing/receipts'),item('Cashier sales session','/billing/billing-sessions/sales-session',<RiTimeLine/>),item('Organization invoices','/billing/organization-invoices'),item('Test price list','/crm/pricelist'),item('View packages','/billing/packages')];
export const MarketingStaffLinks:Link[]=[item('Referrer acquisition & follow-up','/crm/acquisition',<RiCustomerService2Line/>)];
export function roleSidebarSource(role:unknown,supplied:Link[]):Link[]{
 switch(roleWorkspace(role)){
 case 'crm':return CrmStaffLinks;case 'cashier':return CashierLinks;case 'marketer':return MarketingStaffLinks;
 case 'doctor':case 'medicalofficer':case 'consultant':case 'pharmacydoctor':case 'pharmacynurse':return [item('Practitioner workspace','/doctor'),item('Consultations','/doctor/consultation'),item('My clinical access','/doctor/permissions')];
 case 'nurse':case 'nursing':return [item('Patients & triage','/doctor/consultation'),item('Vital signs','/operations/laboratory/vitals/record-vital-sign')];
 case 'headoflaboratory':return [item('Laboratory requisitions','/operations/laboratory/requisitions')];
 case 'headofimaging':return [item('Imaging requisitions','/operations/imaging/ultrasound/requisitions')];
 case 'scientist':return LaboratoryOperationsLinks;case 'phlebotomist':return PhlebotomyLinks;case 'sonographer':return ImagingLinks;
 case 'storekeeper':return InventoryLinks;case 'accountant':return [...AccountingLinks,{title:'Collections',link:'',children:CashierLinks},{title:'Expenses',link:'',children:ExpensesLinks},{title:'Payroll',link:'',children:PayrollLinks}];
 case 'pharmacymanager':case 'pharmacycashier':case 'pharmacystorekeeper':case 'pharmacyaccountant':case 'pharmacydispensaryofficer':case 'pharmacist':return PharmacyLinks;
 default:return supplied;
 }
}
export function filterRoleSidebar(items:Link[],role:unknown,settings:NavigationSettings&{moduleConfiguration?:unknown;smsActivated?:number|boolean|null}={}):Link[]{
 const admin=roleWorkspace(role)==='admin',superAdmin=isSuperAdminRole(role);
 return items.filter(item=>{
  if(item.roles?.length&&item.roles.every(isSuperAdminRole)&&!superAdmin)return false;
  return superAdmin||admin||!item.roles||roleAllowed(role,item.roles);
 }).map(item=>({...item,children:item.children?filterRoleSidebar(item.children,role,settings):undefined})).filter(item=>{
  if(item.link&&(!canAccessRolePage(role,item.link,settings)||(!superAdmin&&!canAccessFacilityModule(item.link,settings.moduleConfiguration,{smsActivated:settings.smsActivated}))))return false;
  if(item.children?.length)return true;
  return !!item.link;
 });
}

export function roleSidebarQuickLinks(role:unknown,supplied:Link[],settings:NavigationSettings&{moduleConfiguration?:unknown;smsActivated?:number|boolean|null}={}){
 const hubs:Record<string,[string,string][]>={
 accountant:[['Accounting','/accounting'],['Collections','/billing/cash-collection'],['Expenses','/billing/expenses'],['Payroll','/human-resource/payroll'],['Inventory valuation','/accounting/inventory/valuation']],
 scientist:[['Laboratory workspace','/operations/laboratory'],['Workbench','/operations/laboratory/workbench'],['Quality control','/operations/laboratory/quality-control'],['Patient registration','/crm/registration'],['Incident reporting','/compliance/incident-reporting']],
 phlebotomist:[['Phlebotomy','/operations/phelobotomy'],['Pending samples','/operations/phelobotomy/pending-samples-collection'],['Sample validation','/operations/laboratory/sample/validation'],['Incident reporting','/compliance/incident-reporting']],
 storekeeper:[['Inventory','/inventory'],['Inventory analytics','/inventory/analytics']],
 pharmacymanager:[['Pharmacy','/pharmacy'],['Point of sale','/pharmacy/sell'],['Inventory','/pharmacy/inventory'],['Finances','/pharmacy/finance'],['Settings','/pharmacy/settings'],['Staff access','/account/staff']],
 pharmacyaccountant:[['Pharmacy finances','/pharmacy/finance'],['Cashier','/pharmacy/cashier'],['Counter invoices','/pharmacy/counter'],['NHIS claims','/pharmacy/nhis'],['Reports','/pharmacy/analytics']],
 pharmacystorekeeper:[['Pharmacy inventory','/pharmacy/inventory'],['Stock control','/pharmacy/stock-control'],['Reports','/pharmacy/analytics']],
 pharmacycashier:[['Point of sale','/pharmacy/sell'],['Cashier shift','/pharmacy/cashier'],['Counter invoices','/pharmacy/counter'],['Sales history','/pharmacy/sales-history']],
 pharmacydispensaryofficer:[['Point of sale','/pharmacy/sell'],['Prescriptions','/pharmacy/prescriptions'],['Clinical review','/pharmacy/clinical'],['Counter invoices','/pharmacy/counter']],
 pharmacist:[['Point of sale','/pharmacy/sell'],['Prescriptions','/pharmacy/prescriptions'],['Clinical review','/pharmacy/clinical'],['Sales history','/pharmacy/sales-history']]
 };
 const source=hubs[roleWorkspace(role)]?.map(([title,path])=>item(title,path))||roleSidebarSource(role,supplied);
 const links=filterRoleSidebar(source,role,settings),seen=new Set<string>();
 const result:{href:string;label:string;text:string;description:string;category:string;icon?:React.ReactNode}[]=[];
 const collect=(items:Link[],category:string)=>{for(const item of items){if(item.link&&!seen.has(item.link)){seen.add(item.link);result.push({href:item.link,label:item.title,text:item.title,description:item.title,category,icon:item.icon});}if(item.children)collect(item.children,item.title);}};
 collect(links,'Your workspace');return result;
}
