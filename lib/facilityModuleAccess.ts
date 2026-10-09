type Module = "pharmacy" | "inventory" | "email" | "sms" | "deviceInterfacing";

export function canAccessFacilityModule(path: string, configuration: unknown): boolean {
     let module: Module | null = null;
     if (/^\/pharmacy(?:\/|$)/.test(path)) module = "pharmacy";
     else if (/^\/inventory(?:\/|$)/.test(path)) module = "inventory";
     else if (/^\/(?:email|settings\/(?:email|applicationsettings\/email))(?:\/|$)/.test(path)) module = "email";
     else if (/^\/(?:sms|settings\/(?:sms|applicationsettings\/sms))(?:\/|$)/.test(path)) module = "sms";
     else if (/^\/settings\/(?:devices|interfacing)(?:\/|$)/.test(path)) module = "deviceInterfacing";
     if (!module || configuration == null || configuration === "") return true;
     try {
          const config = typeof configuration === "string" ? JSON.parse(configuration) : configuration;
          if (!config || typeof config !== "object" || !("modules" in config)) return false;
          const modules = config.modules as Partial<Record<Module, { enabled?: boolean }>>;
          return modules?.[module]?.enabled === true || (module === "inventory" && modules?.pharmacy?.enabled === true);
     } catch {
          return false;
     }
}
