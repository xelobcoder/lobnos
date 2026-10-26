export function workspaceDestination(role:string,configuration?:any){
 const key=String(role||'').toLowerCase().replace(/[ _-]/g,'');
 if(key==='superadmin')return '/settings/facilities';
 if(['doctor','medicalofficer','consultant','nurse','pharmacydoctor','pharmacynurse'].includes(key))return '/doctor';
 if(key==='pharmacyaccountant')return '/pharmacy/finance';
 if(key==='pharmacystorekeeper')return '/pharmacy/inventory';
 if(key==='pharmacycashier')return '/pharmacy/sell';
 if(key.startsWith('pharmacy')||key==='pharmacist')return '/pharmacy';
 if(key==='scientist'||key==='phelobotomist'||key==='phlebotomist')return '/operations/laboratory';
 if(key==='sonographer')return '/operations/imaging';
 if(key==='patient')return '/patientportal';
 if(key==='clinician')return '/doctor';
 if(['cashier','billing','billingofficer'].includes(key))return '/billing/cash-collection';
 if(['crm','frontdesk','receptionist','customerrepresentative'].includes(key))return '/crm/overview';
 if(key==='marketer')return '/crm/acquisition';
 try{const c=typeof configuration==='string'?JSON.parse(configuration):configuration;if(c?.modules?.pharmacy?.enabled&&c.modules?.laboratoryOperations?.enabled!==true&&c.modules?.imaging?.enabled!==true)return '/pharmacy';}catch{}
 if(key==='admin')return '/analytics';
 if(key==='accountant')return '/accounting';
 if(key==='storekeeper')return '/inventory';
 if(key==='customerservicerepresentative')return '/crm/overview';
 return '/';
}
