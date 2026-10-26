type Module = "pharmacy" | "inventory" | "email" | "sms" | "deviceInterfacing" | "laboratoryOperations" | "imaging" | "billing" | "registration" | "consultations" | "analytics";

export function canAccessFacilityModule(
     path: string,
     configuration: unknown,
     operationalSettings?: { smsActivated?: number | boolean | null },
): boolean {
     let feature: Module | null = null;
     if (/^\/pharmacy(?:\/|$)/.test(path)) feature = "pharmacy";
     else if (/^\/inventory(?:\/|$)/.test(path)) feature = "inventory";
     else if (/^\/(?:email(?:-services)?|settings\/(?:email(?:-services)?|applicationsettings\/email))(?:\/|$)/.test(path)) feature = "email";
     else if (/^\/(?:sms|communications\/sms|settings\/(?:sms|applicationsettings\/sms))(?:\/|$)/.test(path)) feature = "sms";
     else if (/^\/settings\/(?:devices|interfacing|super-admin\/medical-devices-interfacing)(?:\/|$)/.test(path)) feature = "deviceInterfacing";
     else if (/^\/operations\/imaging(?:\/|$)/.test(path)) feature="imaging";
     else if (/^\/(?:operations\/(?:laboratory|phelobotomy|phlebotomy)|phelobotomy|phlebotomy|settings\/applicationsettings\/(?:testpanels|resultentrysettings|reportSettings))(?:\/|$)/.test(path)) feature="laboratoryOperations";
     else if (/^\/billing(?:\/|$)/.test(path)&&!/^\/billing\/(?:expenses|insurance)(?:\/|$)/.test(path)) feature="billing";
     else if (/^\/crm\/registration(?:\/|$)/.test(path)) feature="registration";
     else if (/^\/doctor(?:\/|$)/.test(path)) feature="consultations";
     else if (/^\/analytics(?:\/|$)/.test(path)) feature="analytics";
     if (!feature) return true;
     if (feature === "sms" && operationalSettings?.smsActivated !== undefined &&
          Number(operationalSettings.smsActivated) !== 1) return false;
     if (configuration == null || configuration === "") return true;
     try {
          const config = typeof configuration === "string" ? JSON.parse(configuration) : configuration;
          if (!config || typeof config !== "object" || !("modules" in config)) return false;
          const modules = config.modules as Partial<Record<Module, { enabled?: boolean }>>;
          return modules?.[feature]?.enabled === true;
     } catch {
          return false;
     }
}
