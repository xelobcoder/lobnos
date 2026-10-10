type Module = "pharmacy" | "inventory" | "email" | "sms" | "deviceInterfacing";

export function canAccessFacilityModule(path: string, configuration: unknown): boolean {
     let feature: Module | null = null;
     if (/^\/pharmacy(?:\/|$)/.test(path)) feature = "pharmacy";
     else if (/^\/inventory(?:\/|$)/.test(path)) feature = "inventory";
     else if (/^\/(?:email(?:-services)?|settings\/(?:email(?:-services)?|applicationsettings\/email))(?:\/|$)/.test(path)) feature = "email";
     else if (/^\/(?:sms|communications\/sms|settings\/(?:sms|applicationsettings\/sms))(?:\/|$)/.test(path)) feature = "sms";
     else if (/^\/settings\/(?:devices|interfacing|super-admin\/medical-devices-interfacing)(?:\/|$)/.test(path)) feature = "deviceInterfacing";
     if (!feature || configuration == null || configuration === "") return true;
     try {
          const config = typeof configuration === "string" ? JSON.parse(configuration) : configuration;
          if (!config || typeof config !== "object" || !("modules" in config)) return false;
          const modules = config.modules as Partial<Record<Module, { enabled?: boolean }>>;
          return modules?.[feature]?.enabled === true || (feature === "inventory" && modules?.pharmacy?.enabled === true);
     } catch {
          return false;
     }
}
