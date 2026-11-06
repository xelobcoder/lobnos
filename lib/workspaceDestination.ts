/** Navigation only: every destination retains its existing page and API authorization. */
export function workspaceDestination(role: string, configuration?: unknown): string {
 const key = String(role || '').toLowerCase().replace(/[\s_-]/g, '');
 const routes: Record<string, string> = {
  superadmin:'/settings/facilities', doctor:'/doctor', medicalofficer:'/doctor', consultant:'/doctor', nurse:'/doctor', nursing:'/doctor', pharmacydoctor:'/doctor', pharmacynurse:'/doctor', clinician:'/doctor',
  pharmacyaccountant:'/pharmacy/finance', pharmacystorekeeper:'/pharmacy/inventory', pharmacycashier:'/pharmacy/sell', pharmacydispensaryofficer:'/pharmacy/prescriptions', pharmacymanager:'/pharmacy', pharmacist:'/pharmacy',
  headoflaboratory:'/operations/laboratory/requisitions', headofimaging:'/operations/imaging/ultrasound/requisitions', scientist:'/operations/laboratory', labscientist:'/operations/laboratory', phelobotomist:'/operations/phelobotomy', phlebotomist:'/operations/phelobotomy', sonographer:'/operations/imaging', patient:'/patientportal',
  cashier:'/billing/cash-collection', billing:'/billing/cash-collection', billingofficer:'/billing/cash-collection', crm:'/crm/overview', frontdesk:'/crm/overview', frontdeskofficer:'/crm/overview', receptionist:'/crm/overview', customerrepresentative:'/crm/overview', customerservicerepresentative:'/crm/overview', marketer:'/crm/acquisition', accountant:'/accounting', storekeeper:'/inventory',
 };
 if (routes[key]) return routes[key];
 if (key === 'admin' || key === 'manager') {
  try {
   const config = typeof configuration === 'string' ? JSON.parse(configuration) : configuration;
   const modules = (config as { modules?: Record<string, { enabled?: boolean }> } | null)?.modules;
   if (modules?.pharmacy?.enabled && modules.laboratoryOperations?.enabled !== true && modules.imaging?.enabled !== true) return key === 'admin' ? '/pharmacy' : '/account/roles';
  } catch { /* Invalid configuration cannot confer another role or destination. */ }
  return key === 'admin' ? '/analytics' : '/crm/overview';
 }
 return '/unauthorized';
}

/** Preserve the existing portal-management return path allowlist; never accept arbitrary URLs. */
export function loginDestination(role: string, configuration?: unknown, returnTo?: string | null): string {
 const key = String(role || '').toLowerCase().replace(/[\s_-]/g, '');
 if (['admin','manager','superadmin'].includes(key) && returnTo && /^\/patient-portal-admin(?:\/(?:access|settings))?$/.test(returnTo)) return returnTo;
 return workspaceDestination(role, configuration);
}
