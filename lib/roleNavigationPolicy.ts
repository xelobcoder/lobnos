import {normalizeRole,isSuperAdminRole} from '../components/Auth/roles';
export type NavigationSettings={departmentStock?:string[];testPanelsManagement?:boolean;allowScientistToRegisterClient?:number|boolean|null};
export function roleWorkspace(role:unknown){const key=normalizeRole(role);if(['crm','receptionist','frontdesk','frontdeskofficer','customerrepresentative','customerservicerepresentative'].includes(key))return 'crm';if(['cashier','billing','billingofficer'].includes(key))return 'cashier';if(['phlebotomist','phelobotomist'].includes(key))return 'phlebotomist';if(key==='labscientist')return 'scientist';return key;}
export function canAccessDepartmentRequisitions(role:unknown,department:string){
 const key=roleWorkspace(role);
 if(key==='admin'||isSuperAdminRole(role))return true;
 return department==='laboratory'?['scientist','headoflaboratory'].includes(key):department==='imaging'&&['sonographer','headofimaging'].includes(key);
}
export function navigationPath(value:string){try{const raw=value.split(/[?#]/)[0];if(!raw)return '';return decodeURIComponent(raw).replace(/\/+/g,'/').replace(/\/$/,'').toLowerCase()||'/';}catch{return '';}}
const within=(path:string,root:string)=>path===root||path.startsWith(root+'/');
export function isMasterPlatformPath(value:string){const p=navigationPath(value);return ['/settings/facilities','/master','/master-platform','/platform','/settings/super-admin'].some(root=>within(p,root));}
/** Page/navigation policy only. API action, patient scope and approval checks remain authoritative. */
export function canAccessRolePage(role:unknown,value:string,settings:NavigationSettings={}){
 const p=navigationPath(value),key=roleWorkspace(role);if(!p||!p.startsWith('/'))return false;
 if(isMasterPlatformPath(p))return isSuperAdminRole(role);
 if(key==='admin'||isSuperAdminRole(role))return true;
 if(within(p,'/operations/laboratory/requisitions')||within(p,'/operations/imaging/ultrasound/requisitions')){const department=p.includes('/imaging/')?'imaging':'laboratory';return canAccessDepartmentRequisitions(role,department)&&(['headoflaboratory','headofimaging'].includes(key)||!!settings.departmentStock?.includes(department));}
 if(within(p,'/operations/laboratory/test-panels'))return ['scientist','headoflaboratory','manager'].includes(key)&&settings.testPanelsManagement===true;
 if(within(p,'/settings/applicationsettings/testpanels'))return key==='manager'&&settings.testPanelsManagement===true;
 if(within(p,'/communications/sms/contact-groups'))return key==='manager';
 if(within(p,'/communications/sms/provider'))return false;
 if(p==='/billing/packages'&&['crm','cashier','accountant','manager','scientist','phlebotomist','sonographer'].includes(key))return true;
 // Preserve the existing dedicated management-page permission; this does not allow patient impersonation.
 if(key==='manager'&&within(p,'/patient-portal-admin'))return true;
 if(['/accounting/delegations','/accounting/expense-controls'].some(root=>within(p,root)))return false;
 if(p==='/account/staff')return key==='pharmacymanager';
 if(p==='/account/roles')return !['patient','clinician',''].includes(key);
 if(within(p,'/commissions'))return ['manager','accountant'].includes(key);
 if(['/','/unauthorized','/authentication/logout'].includes(p))return true;
 if(within(p,'/human-resource/profile')||within(p,'/compliance/incident-reporting'))return !['patient','clinician',''].includes(key);
 if(key==='patient')return within(p,'/patientportal');
 if(['nurse','nursing'].includes(key))return within(p,'/doctor')||within(p,'/operations/laboratory/vitals');
 if(['clinician','doctor','medicalofficer','consultant','pharmacydoctor','pharmacynurse'].includes(key))return within(p,'/doctor');
 if(key==='marketer')return p==='/crm'||within(p,'/crm/acquisition');
 if(key==='crm'&&(p==='/communications/sms'||['/communications/sms/dashboard','/communications/sms/jobs','/communications/sms/templates'].some(root=>within(p,root))))return true;
 if(key==='crm')return ['/crm/overview','/crm/customers','/crm/registration','/crm/leads','/crm/birthdays','/crm/validated','/crm/pricelist','/crm/referral-codes','/appointments','/operations/queue','/operations/laboratory/undelivered','/billing/patientid','/billing/entity-orders','/billing/suspended-transactions'].some(root=>within(p,root))||['/billing/packages','/clinicians','/clinicians/add-new','/organization'].includes(p);
 if(key==='cashier')return ['/billing/cash-collection','/billing/receipts','/billing/organization-invoices','/billing/billing-sessions/sales-session'].some(root=>within(p,root))||p==='/crm/pricelist';
 if(key==='headoflaboratory')return within(p,'/operations/laboratory/requisitions');
 if(key==='headofimaging')return within(p,'/operations/imaging/ultrasound/requisitions');
 if(key==='scientist')return ['/operations/laboratory','/operations/home-collection','/operations/phelobotomy','/operations/phlebotomy','/phelobotomy','/phlebotomy'].some(root=>within(p,root))||p==='/operations/queue'||(within(p,'/crm/registration')&&Number(settings.allowScientistToRegisterClient)===1);
 if(key==='phlebotomist')return ['/operations/phelobotomy','/operations/phlebotomy','/phelobotomy','/phlebotomy','/operations/laboratory/sample','/operations/laboratory/vitals'].some(root=>within(p,root))||p==='/operations/queue';
 if(key==='sonographer')return within(p,'/operations/imaging')||within(p,'/analytics/imaging');
 if(key==='storekeeper')return within(p,'/inventory');
 if(key==='accountant')return ['/human-resource/payroll','/accounting','/billing/expenses','/billing/insurance','/billing/cash-collection','/billing/receipts','/billing/organization-invoices','/billing/sales','/billing/billing-sessions','/inventory/analytics','/commission-payments','/sales'].some(root=>within(p,root))||['/organization','/clinicians','/crm/pricelist'].includes(p);
 if(key==='manager')return ['/communications/sms','/crm','/billing','/operations','/inventory','/appointments','/organization','/clinicians','/doctor','/compliance','/settings/applicationsettings/testpanels','/settings/applicationsettings/patient-portal','/settings/outsource'].some(root=>within(p,root));
 if(key==='pharmacymanager')return within(p,'/pharmacy');
 if(key==='pharmacystorekeeper')return ['/pharmacy/inventory','/pharmacy/stock','/pharmacy/stock-control','/pharmacy/catalogue','/pharmacy/analytics'].some(root=>within(p,root))||p==='/pharmacy';
 if(key==='pharmacyaccountant')return ['/pharmacy/counter','/pharmacy/cashier','/pharmacy/finance','/pharmacy/accounts','/pharmacy/analytics','/pharmacy/nhis','/pharmacy/sales-history','/pharmacy/stock','/pharmacy/catalogue'].some(root=>within(p,root))||p==='/pharmacy';
 if(['pharmacist','pharmacycashier','pharmacydispensaryofficer'].includes(key))return ['/pharmacy/sell','/pharmacy/counter','/pharmacy/cashier','/pharmacy/prescriptions','/pharmacy/sales-history','/pharmacy/catalogue','/pharmacy/stock','/pharmacy/accounts',...(key!=='pharmacycashier'?['/pharmacy/clinical']:[])].some(root=>within(p,root))||p==='/pharmacy';
 return false;
}
